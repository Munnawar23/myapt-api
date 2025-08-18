import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from 'src/database/entities/delivery.entity';
import { Flat } from 'src/database/entities/flat.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { DeliveriesAdminController } from './deliveries.controller';
import { DeliveriesAdminService } from './deliveries.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery, Flat]), // Flat is needed to find the resident
    RbacModule,
  ],
  controllers: [DeliveriesAdminController],
  providers: [DeliveriesAdminService],
})
export class DeliveriesAdminModule {}
