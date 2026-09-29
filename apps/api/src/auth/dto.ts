import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(2, 80)
  displayName!: string;

  @IsString()
  @Length(12, 200)
  // two letters and two digits: long-but-weak passphrases still fail
  @Matches(/^(?=.*[a-zA-Z].*[a-zA-Z])(?=.*\d.*\d).+$/, {
    message: 'password needs at least two letters and two digits',
  })
  password!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(1, 200)
  password!: string;
}

export class RefreshDto {
  @IsString()
  @Length(32, 128)
  refreshToken!: string;
}
