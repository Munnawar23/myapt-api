import { Module } from '@nestjs/common';
import { DashboardModule } from './dashboard/dashboard.module';
import { BookingsAdminModule } from './bookings/bookings.module';
import { ServiceRequestsAdminModule } from './service-requests/service-requests.module';
import { InvoicesAdminModule } from './invoices/invoices.module';
import { AnnouncementsAdminModule } from './announcements/announcements.module';
import { FeedbackAdminModule } from './feedback/feedback.module';
import { AmenitiesAdminModule } from './amenities/amenities.module';
import { ServicesAdminModule } from './services/services.module';
import { UsersAdminModule } from './users/users.module';
import { ParkingAdminModule } from './parking/parking.module';
import { SocietiesAdminModule } from './societies/societies.module';
import { GatePassesAdminModule } from './gate-passes/gate-passes.module';
import { StaffAdminModule } from './staff/staff.module';
import { DeliveriesAdminModule } from './deliveries/deliveries.module';

@Module({
  imports: [
    DashboardModule,
    BookingsAdminModule,
    ServiceRequestsAdminModule,
    InvoicesAdminModule,
    AnnouncementsAdminModule,
    FeedbackAdminModule,
    AmenitiesAdminModule,
    ServicesAdminModule,
    UsersAdminModule,
    ParkingAdminModule,
    SocietiesAdminModule,
    GatePassesAdminModule,
    StaffAdminModule,
    DeliveriesAdminModule,
  ],
})
export class AdminModule { }
