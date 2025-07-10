import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({
    description: 'The title of the announcement.',
    example: 'Swimming Pool Maintenance',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The full content of the announcement.',
    example:
      'The swimming pool will be closed for annual maintenance from July 10th to July 12th.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
