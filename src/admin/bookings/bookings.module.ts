import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmenityBooking } from 'src/database/entities/amenity-booking.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { BookingsAdminController } from './bookings.controller';
import { BookingsAdminService } from './bookings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AmenityBooking]),
    RbacModule, // For PermissionGuard
  ],
  controllers: [BookingsAdminController],
  providers: [BookingsAdminService],
})
export class BookingsAdminModule {}
