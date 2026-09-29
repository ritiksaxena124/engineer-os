import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { MasteryService } from './mastery.service';
import { ReviewService } from './review.service';

type Authed = Request & { user: { sub: string } };

@Controller('mastery')
@UseGuards(AccessTokenGuard)
export class MasteryController {
  constructor(
    private readonly mastery: MasteryService,
    private readonly reviews: ReviewService,
  ) {}

  @Get()
  standings(@Req() req: Authed) {
    return this.mastery.standings(req.user.sub);
  }

  @Get('reviews/due')
  due(@Req() req: Authed) {
    return this.reviews.due(req.user.sub, new Date());
  }
}
