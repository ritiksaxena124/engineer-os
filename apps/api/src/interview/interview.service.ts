import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { diffLines, diffStats, type DiffLine } from './diff';
import { fitPrompt } from './promptFit';
import { runFiles, summarize, toSandboxFiles, type CheckResult } from './runner';
import { closesAt, isOpeningLate, minutesRemaining, roomPhase, type RoomPhase } from './scheduling';
import type { RoomPromptDto, SaveRoomFilesDto, ScheduleRoomDto } from './dto';

/**
 * The room is a clock-gated copy of a scenario: the candidate never touches the authored rows, only
 * the buffers their room owns, and the checks travel with those buffers so what they run is what the
 * interviewer shipped.
 */
interface RoomRecord {
  id: string;
  scenarioSlug: string;
  candidateLabel: string;
  scheduledAt: Date;
  openMinutes: number;
  openedAt: Date | null;
  endedAt: Date | null;
  scenario: {
    slug: string;
    title: string;
    roleKey: string;
    ticketTitle: string;
    ticketBody: string;
    signalNotes: string;
    files: { path: string; isCheck: boolean }[];
    fixes: { filePath: string; requiredText: string; fixedText: string; rationale: string }[];
  };
  files: { path: string; contents: string }[];
}

interface RoomEventRecord {
  id: string;
  kindKey: string;
  input: string;
  outcome: unknown;
  createdAt: Date;
}

const ROOM_INCLUDE: Prisma.InterviewRoomInclude = {
  scenario: {
    include: {
      files: { orderBy: { position: 'asc' } },
      fixes: { where: { isActive: true }, orderBy: { position: 'asc' } },
    },
  },
  files: true,
};

export interface AppliedFix {
  filePath: string;
  rationale: string;
  diff: DiffLine[];
  stats: { added: number; removed: number };
}

export interface RunReport {
  results: CheckResult[];
  logs: string[];
  crashed: string | null;
  summary: { passed: number; failed: number; allGreen: boolean };
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function checkPathsOf(room: RoomRecord): Set<string> {
  return new Set(room.scenario.files.filter((file) => file.isCheck).map((file) => file.path));
}

@Injectable()
export class InterviewService {
  constructor(private readonly prisma: PrismaService) {}

  /** The scenarios an interviewer can hand out, with the ticket they will be sending with them. */
  async listScenarios() {
    return this.prisma.interviewScenario.findMany({
      where: { isActive: true },
      orderBy: { title: 'asc' },
      select: {
        slug: true,
        title: true,
        roleKey: true,
        ticketTitle: true,
        _count: { select: { files: true, fixes: true } },
      },
    });
  }

  async schedule(hostUserId: string, dto: ScheduleRoomDto) {
    const scenario = await this.prisma.interviewScenario.findFirst({
      where: { slug: dto.scenarioSlug, isActive: true },
      include: { files: { orderBy: { position: 'asc' } } },
    });
    if (!scenario || scenario.files.length === 0) {
      throw new NotFoundException({
        code: 'SCENARIO_NOT_FOUND',
        message: `no interview scenario "${dto.scenarioSlug}" with authored files`,
      });
    }

    // The link is the credential, so only its sha256 is stored — the same rule refresh tokens follow.
    const shareToken = randomBytes(32).toString('base64url');
    const room = await this.prisma.interviewRoom.create({
      data: {
        scenarioSlug: scenario.slug,
        hostUserId,
        candidateLabel: dto.candidateLabel,
        tokenHash: hashToken(shareToken),
        scheduledAt: new Date(dto.scheduledAt),
        openMinutes: dto.openMinutes,
        files: { create: scenario.files.map((file) => ({ path: file.path, contents: file.contents })) },
      },
      include: { scenario: { select: { title: true } } },
    });

    return { shareToken, room: this.presentSummary(room) };
  }

  async listRooms(hostUserId: string, now = new Date()) {
    const rooms = await this.prisma.interviewRoom.findMany({
      where: { hostUserId, isActive: true },
      orderBy: { scheduledAt: 'asc' },
      include: {
        scenario: { select: { title: true } },
        _count: { select: { events: true } },
      },
    });
    return rooms.map((room) => ({
      ...this.presentSummary(room),
      events: room._count.events,
      phase: roomPhase(room, now),
      minutesRemaining: minutesRemaining(room, now),
    }));
  }

  /** Everything the interviewer is allowed to see: the buffers, the ledger, and the authored fixes. */
  async roomDetail(hostUserId: string, roomId: string, now = new Date()) {
    const room = await this.prisma.interviewRoom.findFirst({
      where: { id: roomId, hostUserId, isActive: true },
      include: { ...ROOM_INCLUDE, events: { orderBy: { createdAt: 'asc' } } },
    });
    if (!room) throw new NotFoundException({ code: 'ROOM_NOT_FOUND', message: 'no such interview room' });

    const typed = room as unknown as RoomRecord & { events: RoomEventRecord[] };
    const checks = checkPathsOf(typed);
    return {
      ...this.present(typed, now),
      signalNotes: typed.scenario.signalNotes,
      checks: [...checks],
      fixes: typed.scenario.fixes.map((fix) => ({
        filePath: fix.filePath,
        requiredText: fix.requiredText,
        rationale: fix.rationale,
        applied: typed.files.find((file) => file.path === fix.filePath)?.contents === fix.fixedText,
      })),
      events: typed.events.map((event) => ({
        id: event.id,
        kindKey: event.kindKey,
        input: event.input,
        outcome: event.outcome,
        createdAt: event.createdAt,
      })),
    };
  }

  async closeRoom(hostUserId: string, roomId: string) {
    const room = await this.prisma.interviewRoom.findFirst({ where: { id: roomId, hostUserId, isActive: true } });
    if (!room) throw new NotFoundException({ code: 'ROOM_NOT_FOUND', message: 'no such interview room' });
    if (room.endedAt) {
      throw new ConflictException({ code: 'ROOM_CLOSED', message: 'this room is already closed' });
    }
    await this.prisma.interviewRoom.update({ where: { id: roomId }, data: { endedAt: new Date() } });
    return { closed: true };
  }

  /** The candidate's view. A locked room reveals nothing but the time it opens. */
  async openByToken(shareToken: string, now = new Date()) {
    const room = await this.loadByToken(shareToken);
    const phase = roomPhase(room, now);
    if (phase === 'locked') {
      return {
        phase,
        candidateLabel: room.candidateLabel,
        scheduledAt: room.scheduledAt,
        minutesRemaining: minutesRemaining(room, now),
      };
    }
    if (phase === 'expired') {
      return {
        phase,
        candidateLabel: room.candidateLabel,
        endedAt: room.endedAt ?? closesAt(room),
        ranOut: room.endedAt === null,
      };
    }
    if (room.openedAt) return this.present(room, now);

    const opened = { ...room, openedAt: now };
    await this.prisma.interviewRoom.update({ where: { id: room.id }, data: { openedAt: now } });
    await this.record(room.id, 'opened', 'the candidate opened the room', { late: isOpeningLate(opened, now) });
    return this.present(opened, now);
  }

  async saveFiles(shareToken: string, dto: SaveRoomFilesDto, now = new Date()) {
    const room = await this.requireLive(shareToken, now);
    const checks = checkPathsOf(room);
    const owned = new Set(room.files.map((file) => file.path));

    for (const file of dto.files) {
      if (!owned.has(file.path)) {
        throw new BadRequestException({ code: 'ROOM_FILE_UNKNOWN', message: `${file.path} is not part of this room` });
      }
      if (checks.has(file.path)) {
        throw new BadRequestException({
          code: 'ROOM_CHECK_READ_ONLY',
          message: `${file.path} is a check file and cannot be edited`,
        });
      }
      await this.prisma.interviewRoomFile.update({
        where: { roomId_path: { roomId: room.id, path: file.path } },
        data: { contents: file.contents },
      });
    }

    await this.record(room.id, 'save', dto.files.map((file) => file.path).join(', '), { saved: dto.files.length });
    return this.present(await this.loadByToken(shareToken), now);
  }

  async runChecks(shareToken: string, now = new Date()): Promise<RunReport> {
    const room = await this.requireLive(shareToken, now);
    const report = await this.execute(room);
    await this.record(room.id, 'run', `${room.files.length} files`, {
      summary: report.summary,
      failed: report.results.filter((result) => !result.passed).map((result) => result.name),
      crashed: report.crashed,
    });
    return report;
  }

  /**
   * The scripted fixer: a prompt is graded per authored fix on the terms it names, and a fix that is
   * described well enough is applied for real, so the candidate watches their own code change instead
   * of reading a message about one. Swapping in a model later changes what produces fixedText, not
   * what the room does with it.
   */
  async applyPrompt(shareToken: string, dto: RoomPromptDto, now = new Date()) {
    const room = await this.requireLive(shareToken, now);
    const buffers = new Map(room.files.map((file) => [file.path, file.contents]));
    const applied: AppliedFix[] = [];
    const declined: { filePath: string; missing: string[] }[] = [];
    const already: string[] = [];

    for (const fix of room.scenario.fixes) {
      const fit = fitPrompt(dto.prompt, fix.requiredText);
      if (!fit.satisfied) {
        declined.push({ filePath: fix.filePath, missing: fit.missing });
        continue;
      }
      const before = buffers.get(fix.filePath);
      if (before === undefined) {
        declined.push({ filePath: fix.filePath, missing: ['this file is not in your room'] });
        continue;
      }
      if (before === fix.fixedText) {
        already.push(fix.filePath);
        continue;
      }
      await this.prisma.interviewRoomFile.update({
        where: { roomId_path: { roomId: room.id, path: fix.filePath } },
        data: { contents: fix.fixedText },
      });
      buffers.set(fix.filePath, fix.fixedText);
      const diff = diffLines(before, fix.fixedText);
      applied.push({ filePath: fix.filePath, rationale: fix.rationale, diff, stats: diffStats(diff) });
    }

    const updated = await this.loadByToken(shareToken);
    const report = applied.length > 0 ? await this.execute(updated) : null;
    await this.record(room.id, 'prompt', dto.prompt, {
      applied: applied.map((fix) => fix.filePath),
      already,
      declined,
      summary: report?.summary ?? null,
    });

    return { applied, already, declined, report, room: this.present(updated, now) };
  }

  private async execute(room: RoomRecord): Promise<RunReport> {
    const checks = checkPathsOf(room);
    const outcome = await runFiles(
      toSandboxFiles(room.files.map((file) => ({ ...file, isCheck: checks.has(file.path) }))),
    );
    return { ...outcome, summary: summarize(outcome) };
  }

  private async requireLive(shareToken: string, now: Date): Promise<RoomRecord> {
    const room = await this.loadByToken(shareToken);
    const phase: RoomPhase = roomPhase(room, now);
    if (phase === 'locked') {
      throw new ConflictException({
        code: 'ROOM_LOCKED',
        message: `this interview opens at ${room.scheduledAt.toISOString()}`,
      });
    }
    if (phase === 'expired') {
      throw new ConflictException({ code: 'ROOM_CLOSED', message: 'this interview window has closed' });
    }
    return room;
  }

  private async loadByToken(shareToken: string): Promise<RoomRecord> {
    const room = await this.prisma.interviewRoom.findFirst({
      where: { tokenHash: hashToken(shareToken), isActive: true },
      include: ROOM_INCLUDE,
    });
    if (!room) {
      throw new NotFoundException({ code: 'ROOM_NOT_FOUND', message: 'this interview link is not valid' });
    }
    return room as unknown as RoomRecord;
  }

  private present(room: RoomRecord, now: Date) {
    const checks = checkPathsOf(room);
    return {
      phase: roomPhase(room, now),
      id: room.id,
      candidateLabel: room.candidateLabel,
      scheduledAt: room.scheduledAt,
      closesAt: closesAt(room),
      openedAt: room.openedAt,
      endedAt: room.endedAt,
      minutesRemaining: minutesRemaining(room, now),
      openedLate: isOpeningLate(room, now),
      scenario: {
        slug: room.scenario.slug,
        title: room.scenario.title,
        roleKey: room.scenario.roleKey,
        ticketTitle: room.scenario.ticketTitle,
        ticketBody: room.scenario.ticketBody,
      },
      files: room.files.map((file) => ({
        path: file.path,
        contents: file.contents,
        isCheck: checks.has(file.path),
      })),
    };
  }

  private presentSummary(room: {
    id: string;
    scenarioSlug: string;
    candidateLabel: string;
    scheduledAt: Date;
    openMinutes: number;
    openedAt: Date | null;
    endedAt: Date | null;
    scenario: { title: string };
  }) {
    return {
      id: room.id,
      scenarioSlug: room.scenarioSlug,
      scenarioTitle: room.scenario.title,
      candidateLabel: room.candidateLabel,
      scheduledAt: room.scheduledAt,
      closesAt: closesAt(room),
      openMinutes: room.openMinutes,
      openedAt: room.openedAt,
      endedAt: room.endedAt,
    };
  }

  private async record(roomId: string, kindKey: string, input: string, outcome: Prisma.InputJsonValue) {
    await this.prisma.interviewRoomEvent.create({ data: { roomId, kindKey, input, outcome } });
  }
}
