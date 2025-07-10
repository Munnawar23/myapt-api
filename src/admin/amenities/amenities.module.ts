import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Amenity } from 'src/database/entities/amenity.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { AmenitiesAdminController } from './amenities.controller';
import { AmenitiesAdminService } from './amenities.service';

@Module({
  imports: [TypeOrmModule.forFeature([Amenity]), RbacModule],
  controllers: [AmenitiesAdminController],
  providers: [AmenitiesAdminService],
})
export class AmenitiesAdminModule {}
