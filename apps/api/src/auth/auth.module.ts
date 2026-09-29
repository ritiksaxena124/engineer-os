import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './access-token.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordHasher } from './password-hasher';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenGuard,
    {
      provide: PasswordHasher,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new PasswordHasher(config.getOrThrow<number>('PASSWORD_WORK_FACTOR')),
    },
  ],
  exports: [AuthService, AccessTokenGuard],
})
export class AuthModule {}
