import { Module } from '@nestjs/common';
import { ParkingController } from './parking.controller';
import { ParkingService } from './parking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingRequest } from 'src/database/entities/parking-request.entity';
import { ParkingSlot } from 'src/database/entities/parking-slot.entity';
import { ParkingZone } from 'src/database/entities/parking-zone.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ParkingZone, ParkingSlot, ParkingRequest]),
  ],
  controllers: [ParkingController],
  providers: [ParkingService],
})
export class ParkingModule {}
