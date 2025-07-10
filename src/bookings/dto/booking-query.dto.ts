import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BookingStatus } from 'src/database/entities/amenity-booking.entity';

export class BookingQueryDto {
  @ApiPropertyOptional({
    description: 'Filter bookings by status',
    enum: BookingStatus,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
