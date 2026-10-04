import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InterviewController, InterviewRoomController } from './interview.controller';
import { InterviewService } from './interview.service';

@Module({
  imports: [AuthModule],
  controllers: [InterviewController, InterviewRoomController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}
