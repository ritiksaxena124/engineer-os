import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AttemptDto, QuestionQueryDto } from './dto';
import { QuestionService } from './question.service';

@Controller('questions')
@UseGuards(AccessTokenGuard)
export class QuestionController {
  constructor(private readonly questions: QuestionService) {}

  @Get()
  list(@Query() query: QuestionQueryDto) {
    return this.questions.list(query);
  }

  @Get(':slug')
  question(@Req() req: Request & { user: { sub: string } }, @Param('slug') slug: string) {
    return this.questions.question(req.user.sub, slug);
  }

  @Post(':slug/attempt')
  attempt(
    @Req() req: Request & { user: { sub: string } },
    @Param('slug') slug: string,
    @Body() dto: AttemptDto,
  ) {
    return this.questions.attempt(req.user.sub, slug, dto);
  }
}
