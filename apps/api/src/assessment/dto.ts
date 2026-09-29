import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DiagnosticAnswerDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @MaxLength(20000)
  answerText!: string;
}

export class SubmitDiagnosticDto {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DiagnosticAnswerDto)
  answers!: DiagnosticAnswerDto[];
}

export class ExamPhaseDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'phaseKey is a slug like p07' })
  phaseKey!: string;
}

export class ExamAnswerDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @MaxLength(20000)
  answerText!: string;
}

export class SubmitExamDto {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExamAnswerDto)
  answers!: ExamAnswerDto[];
}
