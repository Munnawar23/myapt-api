import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmenityBooking } from 'src/database/entities/amenity-booking.entity';
import { Amenity } from 'src/database/entities/amenity.entity';
import { AmenitySlot } from 'src/database/entities/amenity-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AmenityBooking, AmenitySlot])],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
