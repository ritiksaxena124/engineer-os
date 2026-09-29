import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MasteryController } from './mastery.controller';
import { MasteryService } from './mastery.service';
import { ReviewService } from './review.service';

@Module({
  imports: [AuthModule],
  controllers: [MasteryController],
  providers: [MasteryService, ReviewService],
  exports: [MasteryService, ReviewService],
})
export class MasteryModule {}
