import { Module } from '@nestjs/common';
import { User } from './database/entities/user.entity';
import { Role } from './database/entities/role.entity';
import { Permission } from './database/entities/permission.entity';
import { RbacModule } from './rbac/rbac.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { Flat } from './database/entities/flat.entity';
import { FamilyMember } from './database/entities/family-member.entity';
import { ProfileModule } from './profile/rofile.module';
import { AmenitiesModule } from './amenities/amenities.module';
import { BookingsModule } from './bookings/bookings.module';
import { AmenityBooking } from './database/entities/amenity-booking.entity';
import { Amenity } from './database/entities/amenity.entity';
import { ServicesModule } from './services/services.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { ServiceRequest } from './database/entities/service-request.entity';
import { Service } from './database/entities/service.entity';
import { GatePassesModule } from './gate-passes/gate-passes.module';
import { GatePass } from './database/entities/gate-pass.entity';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { Delivery } from './database/entities/delivery.entity';
import { InvoicesModule } from './invoices/invoices.module';
import { Invoice } from './database/entities/invoice.entity';
import { Payment } from './database/entities/payment.entity';
import { FeedbackModule } from './feedback/feedback.module';
import { Feedback } from './database/entities/feedback.entity';
import { AdminModule } from './admin/admin.module';
import { Announcement } from './database/entities/announcement.entity';
import { ParkingModule } from './parking/parking.module';
import { ParkingZone } from './database/entities/parking-zone.entity';
import { ParkingSlot } from './database/entities/parking-slot.entity';
import { ParkingRequest } from './database/entities/parking-request.entity';
import { AmenitySlot } from './database/entities/amenity-slot.entity';
import { Society } from './database/entities/society.entity';
import { SocietiesModule } from './societies/societies.module';
import { SocietyAdminModule } from './society-admin/society-admin.module';
import { AnnouncementsAdminModule } from './admin/announcements/announcements.module';
import { AnnouncementsModule } from './announcements/announcements.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'my_apt_db',
      entities: [
        User,
        Role,
        Permission,
        Flat,
        FamilyMember,
        Amenity,
        AmenityBooking,
        Service,
        ServiceRequest,
        Service,
        ServiceRequest,
        GatePass,
        Delivery,
        Invoice,
        Payment,
        Feedback,
        Announcement,
        ParkingZone,
        ParkingSlot,
        ParkingRequest,
        AmenitySlot,
        Society,
      ],
      synchronize: true,
    }),
    RbacModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    AmenitiesModule,
    BookingsModule,
    ServicesModule,
    ServiceRequestsModule,
    GatePassesModule,
    DeliveriesModule,
    InvoicesModule,
    FeedbackModule,
    AdminModule,
    ParkingModule,
    SocietiesModule,
    SocietyAdminModule,
    AnnouncementsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
