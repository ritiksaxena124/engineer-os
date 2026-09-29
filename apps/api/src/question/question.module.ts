import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';

@Module({
  imports: [AuthModule, CurriculumModule],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
