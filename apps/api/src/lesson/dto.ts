import { IsNotEmpty, IsString } from 'class-validator';

export class TopicQueryDto {
  @IsString()
  @IsNotEmpty()
  topic!: string;
}
