import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
  ValidatorConstraint,
  type ValidationArguments,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { QUESTION_CATEGORIES } from '../../prisma/content/reference';
import { COMPANIES } from '../../prisma/content/companies';

const CATEGORY_KEYS = QUESTION_CATEGORIES.map((row) => row.key);
const COMPANY_KEYS = COMPANIES.map((row) => row.key);

/**
 * A range nobody can satisfy is a bug in the caller rather than an empty page, so it is refused
 * with the rest of the input instead of being silently swapped.
 */
@ValidatorConstraint({ name: 'orderedDifficultyRange' })
class OrderedDifficultyRange implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const filter = args.object as QuestionQueryDto;
    if (filter.minDifficulty === undefined || filter.maxDifficulty === undefined) return true;
    return filter.minDifficulty <= filter.maxDifficulty;
  }

  defaultMessage(): string {
    return 'minDifficulty cannot sit above maxDifficulty';
  }
}

export class QuestionQueryDto {
  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsIn(CATEGORY_KEYS)
  category?: string;

  // 'untagged' is a facet of its own: a question with no company tag is a real answer, not a
  // row whose data is missing.
  @IsOptional()
  @IsIn([...COMPANY_KEYS, 'untagged'])
  company?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  @Validate(OrderedDifficultyRange)
  minDifficulty?: number;

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

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  search?: string;
}

export class AttemptDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  answerText!: string;
}
