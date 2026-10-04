import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { InterviewService } from './interview.service';
import { RoomPromptDto, SaveRoomFilesDto, ScheduleRoomDto } from './dto';

/** The interviewer's side: schedule a room, hand out the link, read the evidence afterwards. */
@Controller('interview')
@UseGuards(AccessTokenGuard)
export class InterviewController {
  constructor(private readonly interviews: InterviewService) {}

  @Get('scenarios')
  scenarios() {
    return this.interviews.listScenarios();
  }

  @Post('rooms')
  schedule(@Req() req: Request & { user: { sub: string } }, @Body() dto: ScheduleRoomDto) {
    return this.interviews.schedule(req.user.sub, dto);
  }

  @Get('rooms')
  rooms(@Req() req: Request & { user: { sub: string } }) {
    return this.interviews.listRooms(req.user.sub);
  }

  @Get('rooms/:id')
  room(@Req() req: Request & { user: { sub: string } }, @Param('id') id: string) {
    return this.interviews.roomDetail(req.user.sub, id);
  }

  @Post('rooms/:id/close')
  close(@Req() req: Request & { user: { sub: string } }, @Param('id') id: string) {
    return this.interviews.closeRoom(req.user.sub, id);
  }
}

/**
 * The candidate's side. Deliberately unguarded: the share token in the path is the whole credential,
 * which is why it is stored hashed and why every handler re-checks the clock.
 */
@Controller('interview/room')
export class InterviewRoomController {
  constructor(private readonly interviews: InterviewService) {}

  @Get(':token')
  open(@Param('token') token: string) {
    return this.interviews.openByToken(token);
  }

  @Post(':token/save')
  save(@Param('token') token: string, @Body() dto: SaveRoomFilesDto) {
    return this.interviews.saveFiles(token, dto);
  }

  @Post(':token/run')
  run(@Param('token') token: string) {
    return this.interviews.runChecks(token);
  }

  @Post(':token/prompt')
  prompt(@Param('token') token: string, @Body() dto: RoomPromptDto) {
    return this.interviews.applyPrompt(token, dto);
  }
}
