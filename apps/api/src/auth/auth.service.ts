import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { PasswordHasher } from './password-hasher';
import { PrismaService } from '../prisma/prisma.service';

type PublicUser = { id: string; email: string; displayName: string; roleKey: string };

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

const UNITS = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const;

function ttlMs(spec: string): number {
  const match = /^(\d+)([smhd])$/.exec(spec);
  if (!match) throw new Error(`unsupported token ttl: ${spec}`);
  return Number(match[1]) * UNITS[match[2] as keyof typeof UNITS];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly passwords: PasswordHasher,
  ) {}

  async register(input: { email: string; displayName: string; password: string }): Promise<Session> {
    const email = input.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) throw new ConflictException('an account with that email already exists');

    const user = await this.prisma.user.create({
      data: {
        email,
        displayName: input.displayName,
        passwordHash: await this.passwords.hash(input.password),
      },
      select: { id: true, email: true, displayName: true, roleKey: true },
    });

    return this.issueSession(user);
  }

  async login(email: string, password: string): Promise<Session> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        displayName: true,
        roleKey: true,
        passwordHash: true,
        isActive: true,
      },
    });

    // Cost the same work whether or not the account exists, and answer with the same
    // message either way: neither timing nor wording may confirm that an email is registered.
    const matches = await this.passwords.verify(password, user?.isActive ? user.passwordHash : null);
    if (!user || !user.isActive || !matches) {
      throw new UnauthorizedException('email or password is incorrect');
    }

    return this.issueSession({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roleKey: user.roleKey,
    });
  }

  async refresh(presented: string): Promise<Session> {
    const tokenHash = this.hash(presented);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true, displayName: true, roleKey: true, isActive: true } } },
    });

    if (!stored || !stored.user.isActive) {
      throw new UnauthorizedException('session is no longer valid');
    }

    if (stored.revokedAt) {
      // A consumed token came back. Either this request or the one that consumed it is
      // an attacker, so the whole family is revoked and both parties get logged out.
      await this.revokeAllFor(stored.userId);
      throw new UnauthorizedException('session is no longer valid');
    }

    if (stored.expiresAt.getTime() < Date.now()) {
      await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
      throw new UnauthorizedException('session expired');
    }

    const { session, refreshTokenId } = await this.issueSessionWithId(stored.user);
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedBy: refreshTokenId },
    });

    return session;
  }

  /** Idempotent: logging out with an unknown or already-revoked token is still success. */
  async logout(presented: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hash(presented), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async profile(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isActive: true },
      select: { id: true, email: true, displayName: true, roleKey: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('session is no longer valid');
    return user;
  }

  async verifyAccessToken(token: string): Promise<{ sub: string; role: string }> {
    try {
      return await this.jwt.verifyAsync<{ sub: string; role: string }>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('access token is not valid');
    }
  }

  private async issueSession(user: PublicUser): Promise<Session> {
    return (await this.issueSessionWithId(user)).session;
  }

  private async issueSessionWithId(
    user: PublicUser,
  ): Promise<{ session: Session; refreshTokenId: string }> {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, role: user.roleKey },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: Math.floor(ttlMs(this.config.getOrThrow<string>('ACCESS_TOKEN_TTL')) / 1000),
      },
    );

    const refreshToken = randomBytes(32).toString('hex');
    const row = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hash(refreshToken),
        expiresAt: new Date(Date.now() + ttlMs(this.config.getOrThrow<string>('REFRESH_TOKEN_TTL'))),
      },
      select: { id: true },
    });

    return { session: { accessToken, refreshToken, user }, refreshTokenId: row.id };
  }

  private async revokeAllFor(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
