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
import { SlotsAdminModule } from './slots/slots.module';
import { SocietiesAdminModule } from './societies/societies.module';

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
    SlotsAdminModule,
    SocietiesAdminModule,
  ],
})
export class AdminModule {}
