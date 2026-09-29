import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AssessmentService } from './assessment.service';
import { ExamPhaseDto, SubmitDiagnosticDto, SubmitExamDto } from './dto';

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

  @Post('exam')
  startExam(@Req() req: Request & { user: { sub: string } }, @Body() dto: ExamPhaseDto) {
    return this.assessments.startExam(req.user.sub, dto.phaseKey);
  }

  @Post('exam/submit')
  submitExam(@Req() req: Request & { user: { sub: string } }, @Body() dto: SubmitExamDto) {
    return this.assessments.submitExam(req.user.sub, dto);
  }
}
