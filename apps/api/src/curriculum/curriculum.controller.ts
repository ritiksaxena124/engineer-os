import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { CurriculumService } from './curriculum.service';
import { TrackQueryDto } from './dto';

@Controller('curriculum')
@UseGuards(AccessTokenGuard)
export class CurriculumController {
  constructor(private readonly curriculum: CurriculumService) {}

  @Get('phases')
  phases(@Query() query: TrackQueryDto) {
    return this.curriculum.phases(query.track);
  }

  @Get('topics')
  topics(@Req() req: Request & { user: { sub: string } }, @Query() query: TrackQueryDto) {
    return this.curriculum.catalog(req.user.sub, query.track);
  }

  @Get('topics/:slug/repair-path')
  repairPath(@Req() req: Request & { user: { sub: string } }, @Param('slug') slug: string) {
    return this.curriculum.repairPathFor(req.user.sub, slug);
  }
}
