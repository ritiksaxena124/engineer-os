import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurriculumService } from '../curriculum/curriculum.service';

@Injectable()
export class LessonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly curriculum: CurriculumService,
  ) {}

  async read(userId: string, slug: string) {
    const { lesson, topicSlug } = await this.findLesson(slug);
    await this.assertUnlocked(userId, topicSlug);

    const read = await this.prisma.lessonRead.findUnique({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
    });

    return { lesson: this.shape(lesson, read?.readAt ?? null) };
  }

  async forTopic(userId: string, topicSlug: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: { isActive: true, topic: { slug: topicSlug } },
      orderBy: { slug: 'asc' },
      include: {
        sections: { orderBy: { position: 'asc' }, select: { id: true } },
        reads: { where: { userId }, select: { readAt: true } },
      },
    });

    return {
      lessons: lessons.map((lesson) => ({
        slug: lesson.slug,
        title: lesson.title,
        topicSlug,
        sectionCount: lesson.sections.length,
        readAt: lesson.reads[0]?.readAt ?? null,
      })),
    };
  }

  /**
   * A read is exposure, not evidence: it writes lesson_reads and nothing else. No mastery
   * record, no mastery event, no signal — the ladder starts at the answer, not at the page.
   */
  async markRead(userId: string, slug: string) {
    const { lesson, topicSlug } = await this.findLesson(slug);
    await this.assertUnlocked(userId, topicSlug);

    const row = await this.prisma.lessonRead.upsert({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
      create: { userId, lessonId: lesson.id },
      update: {},
    });

    return { slug: lesson.slug, readAt: row.readAt };
  }

  private async findLesson(slug: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { slug },
      include: {
        topic: { select: { slug: true } },
        sections: {
          orderBy: { position: 'asc' },
          include: { sectionKind: { select: { label: true, guidance: true, sortOrder: true } } },
        },
      },
    });

    if (!lesson || !lesson.isActive) {
      throw new NotFoundException({
        code: 'LESSON_NOT_FOUND',
        message: `no lesson "${slug}"`,
      });
    }
    return { lesson, topicSlug: lesson.topic.slug };
  }

  private async assertUnlocked(userId: string, topicSlug: string) {
    const gating = await this.curriculum.unlockStateForTopic(userId, topicSlug);
    if (!gating) {
      throw new NotFoundException({
        code: 'TOPIC_NOT_FOUND',
        message: `no topic "${topicSlug}"`,
      });
    }
    if (gating.state.unlocked) return;

    throw new ForbiddenException({
      code: 'TOPIC_LOCKED',
      message: `this lesson sits on "${topicSlug}", which is not unlocked yet`,
      details: {
        blockedBy: gating.state.blockedBy,
        warnings: gating.state.warnings,
        repairPath: (await this.curriculum.repairPathFor(userId, topicSlug)).path,
      },
    });
  }

  private shape(
    lesson: {
      slug: string;
      title: string;
      topic: { slug: string };
      sections: {
        kindKey: string;
        body: string;
        position: number;
        sectionKind: { label: string; guidance: string; sortOrder: number };
      }[];
    },
    readAt: Date | null,
  ) {
    return {
      slug: lesson.slug,
      title: lesson.title,
      topicSlug: lesson.topic.slug,
      readAt,
      sections: lesson.sections.map((section) => ({
        kind: section.kindKey,
        label: section.sectionKind.label,
        guidance: section.sectionKind.guidance,
        body: section.body,
        position: section.position,
      })),
    };
  }
}
