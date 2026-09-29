import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { TopicQueryDto } from './dto';
import { LessonService } from './lesson.service';

@Controller('lessons')
@UseGuards(AccessTokenGuard)
export class LessonController {
  constructor(private readonly lessons: LessonService) {}

  @Get()
  forTopic(@Req() req: Request & { user: { sub: string } }, @Query() query: TopicQueryDto) {
    return this.lessons.forTopic(req.user.sub, query.topic);
  }

  @Get(':slug')
  read(@Req() req: Request & { user: { sub: string } }, @Param('slug') slug: string) {
    return this.lessons.read(req.user.sub, slug);
  }

  @Post(':slug/read')
  markRead(@Req() req: Request & { user: { sub: string } }, @Param('slug') slug: string) {
    return this.lessons.markRead(req.user.sub, slug);
  }
}
