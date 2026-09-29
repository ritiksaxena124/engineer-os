import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { QUESTION_CATEGORIES } from '../../prisma/content/reference';

const CATEGORY_KEYS = QUESTION_CATEGORIES.map((row) => row.key);

export class QuestionQueryDto {
  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsIn(CATEGORY_KEYS)
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  maxDifficulty?: number;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  diagnostic?: boolean;
}

export class AttemptDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  answerText!: string;
}
