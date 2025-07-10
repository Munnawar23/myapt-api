import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { FeedbackType } from 'src/database/entities/feedback.entity';

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'The comment or feedback text.',
    example: 'The swimming pool water was a bit cold today.',
  })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiPropertyOptional({
    description: 'A rating from 1 to 5.',
    example: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'The type of feedback being submitted.',
    enum: FeedbackType,
    default: FeedbackType.FEEDBACK,
  })
  @IsOptional()
  @IsEnum(FeedbackType)
  type?: FeedbackType;

  @ApiPropertyOptional({
    description: 'An optional URL to an image related to the feedback.',
    example: 'https://example.com/images/feedback.jpg',
  })
  @IsOptional()
  @IsUrl()
  image_url?: string;
}
