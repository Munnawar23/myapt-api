import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingZone } from 'src/database/entities/parking-zone.entity';
import { ParkingSlot } from 'src/database/entities/parking-slot.entity';
import { User } from 'src/database/entities/user.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { ParkingAdminController } from './parking.controller';
import { ParkingAdminService } from './parking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParkingZone, ParkingSlot, User]),
    RbacModule,
  ],
  controllers: [ParkingAdminController],
  providers: [ParkingAdminService],
})
export class ParkingAdminModule {}
