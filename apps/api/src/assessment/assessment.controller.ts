import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AssessmentService } from './assessment.service';
import { SubmitDiagnosticDto } from './dto';

@Controller('assessments')
@UseGuards(AccessTokenGuard)
export class AssessmentController {
  constructor(private readonly assessments: AssessmentService) {}

  @Post('diagnostic')
  startDiagnostic(@Req() req: Request & { user: { sub: string } }) {
    return this.assessments.startDiagnostic(req.user.sub);
  }

  @Post('diagnostic/submit')
  submitDiagnostic(@Req() req: Request & { user: { sub: string } }, @Body() dto: SubmitDiagnosticDto) {
    return this.assessments.submitDiagnostic(req.user.sub, dto);
  }
}
