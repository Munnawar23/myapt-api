import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Amenity } from 'src/database/entities/amenity.entity';
import { AmenitiesController } from './amenities.controller';
import { AmenitiesService } from './amenities.service';
import { AmenitySlot } from 'src/database/entities/amenity-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Amenity, AmenitySlot])],
  controllers: [AmenitiesController],
  providers: [AmenitiesService],
  exports: [AmenitiesService],
})
export class AmenitiesModule {}
