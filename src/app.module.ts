import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// ENTITIES
import { User } from './database/entities/user.entity';
import { Role } from './database/entities/role.entity';
import { Permission } from './database/entities/permission.entity';
import { Flat } from './database/entities/flat.entity';
import { FamilyMember } from './database/entities/family-member.entity';
import { Amenity } from './database/entities/amenity.entity';
import { AmenityBooking } from './database/entities/amenity-booking.entity';
import { Service } from './database/entities/service.entity';
import { ServiceRequest } from './database/entities/service-request.entity';
import { GatePass } from './database/entities/gate-pass.entity';
import { Delivery } from './database/entities/delivery.entity';
import { Invoice } from './database/entities/invoice.entity';
import { Payment } from './database/entities/payment.entity';
import { Feedback } from './database/entities/feedback.entity';
import { Announcement } from './database/entities/announcement.entity';
import { ParkingZone } from './database/entities/parking-zone.entity';
import { ParkingSlot } from './database/entities/parking-slot.entity';
import { ParkingRequest } from './database/entities/parking-request.entity';
import { AmenitySlot } from './database/entities/amenity-slot.entity';
import { Society } from './database/entities/society.entity';
import { VisitorLog } from './database/entities/visitor-log.entity';
import { Staff } from './database/entities/staff.entity';
import { StaffLog } from './database/entities/staff-log.entity';

// MODULES
import { RbacModule } from './rbac/rbac.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ProfileModule } from './profile/rofile.module';
import { AmenitiesModule } from './amenities/amenities.module';
import { BookingsModule } from './bookings/bookings.module';
import { ServicesModule } from './services/services.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { GatePassesModule } from './gate-passes/gate-passes.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { InvoicesModule } from './invoices/invoices.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AdminModule } from './admin/admin.module';
import { ParkingModule } from './parking/parking.module';
import { SocietiesModule } from './societies/societies.module';
import { SocietyAdminModule } from './society-admin/society-admin.module';
import { AnnouncementsAdminModule } from './admin/announcements/announcements.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { StaffModule } from './staff/staff.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ✅ CLOUD DATABASE (NEON)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',

        // 🔥 Pull from .env
        url: config.get<string>('DATABASE_URL'),

        // REQUIRED for cloud postgres
        ssl: {
          rejectUnauthorized: false,
        },

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
          VisitorLog,
          Staff,
          StaffLog,
        ],

        // ✅ KEEP TRUE for first cloud sync
        synchronize: false,
      }),
      inject: [ConfigService],
    }),

    // APP MODULES
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
    AnnouncementsAdminModule,
    StaffModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
