import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Amenity } from 'src/database/entities/amenity.entity';
import { AmenitySlot } from 'src/database/entities/amenity-slot.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { SlotsAdminController } from './slots.controller';
import { SlotsAdminService } from './slots.service';

@Module({
  imports: [TypeOrmModule.forFeature([Amenity, AmenitySlot]), RbacModule],
  controllers: [SlotsAdminController],
  providers: [SlotsAdminService],
})
export class SlotsAdminModule {}
