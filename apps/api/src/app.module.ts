import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { LessonModule } from './lesson/lesson.module';
import { QuestionModule } from './question/question.module';
import { AssessmentModule } from './assessment/assessment.module';
import { HealthController } from './health/health.controller';
import { loadEnv } from './config/env';
import { requestId } from './common/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [() => loadEnv()] }),
    PrismaModule,
    AuthModule,
    CurriculumModule,
    LessonModule,
    QuestionModule,
    AssessmentModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(requestId).forRoutes('*');
  }
}
