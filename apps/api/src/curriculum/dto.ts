import { IsIn, IsOptional } from 'class-validator';

export class TrackQueryDto {
  @IsOptional()
  @IsIn(['backend', 'fullstack', 'agentic-ai'])
  track?: string;
}
