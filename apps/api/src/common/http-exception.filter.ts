import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('http');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'internal error' };

    const detail = typeof payload === 'string' ? {} : (payload as Record<string, unknown>);

    const body = {
      error: {
        status,
        code:
          (typeof detail.code === 'string' && detail.code) ||
          (status === HttpStatus.INTERNAL_SERVER_ERROR ? 'internal_error' : 'request_failed'),
        message:
          typeof payload === 'string'
            ? payload
            : ((detail.message as string | string[] | undefined) ?? 'request failed'),
        requestId: req.requestId,
      },
    };

    if (status >= 500) {
      this.logger.error(
        JSON.stringify({
          level: 'error',
          requestId: req.requestId,
          method: req.method,
          path: req.url,
          status,
          detail: exception instanceof Error ? exception.message : String(exception),
        }),
      );
    } else {
      this.logger.warn(
        JSON.stringify({
          level: 'warn',
          requestId: req.requestId,
          method: req.method,
          path: req.url,
          status,
        }),
      );
    }

    res.status(status).json(body);
  }
}
