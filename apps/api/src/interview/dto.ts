import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ScheduleRoomDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'scenarioSlug is a slug like cancelled-order-still-ships' })
  scenarioSlug!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  candidateLabel!: string;

  @IsISO8601()
  scheduledAt!: string;

  @IsInt()
  @Min(15)
  @Max(240)
  openMinutes!: number;
}

export class CloseRoomDto {
  @IsISO8601()
  endedAt!: string;
}

export class RoomFileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  path!: string;

  @IsString()
  @MaxLength(60_000)
  contents!: string;
}

export class SaveRoomFilesDto {
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => RoomFileDto)
  files!: RoomFileDto[];
}

export class RoomPromptDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4_000)
  prompt!: string;
}
