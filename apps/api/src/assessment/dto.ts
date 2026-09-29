import { ArrayMinSize, IsArray, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';
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
