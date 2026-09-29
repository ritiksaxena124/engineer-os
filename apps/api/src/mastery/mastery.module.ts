import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { MasteryController } from './mastery.controller';
import { MasteryService } from './mastery.service';
import { ReviewService } from './review.service';
import { WeaknessService } from './weakness.service';

@Module({
  imports: [AuthModule, CurriculumModule],
  controllers: [MasteryController],
  providers: [MasteryService, ReviewService, WeaknessService],
  exports: [MasteryService, ReviewService, WeaknessService],
})
export class MasteryModule {}
