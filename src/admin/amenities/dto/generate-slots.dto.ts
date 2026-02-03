import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class GenerateSlotsDto {
    @ApiProperty({ example: '2026-02-01' })
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @ApiProperty({ example: '2026-02-28' })
    @IsDateString()
    @IsNotEmpty()
    endDate: string;
}
