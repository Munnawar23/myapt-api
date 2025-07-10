import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { AmenityBooking } from 'src/database/entities/amenity-booking.entity';
import { ServiceRequest } from 'src/database/entities/service-request.entity';
import { Feedback } from 'src/database/entities/feedback.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { RbacModule } from 'src/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AmenityBooking, ServiceRequest, Feedback]),
    RbacModule, // For PermissionGuard
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
