import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';

@Module({
  imports: [AuthModule, CurriculumModule],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}
