import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequest } from 'src/database/entities/service-request.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { ServiceRequestsAdminController } from './service-requests.controller';
import { ServiceRequestsAdminService } from './service-requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest]), RbacModule],
  controllers: [ServiceRequestsAdminController],
  providers: [ServiceRequestsAdminService],
})
export class ServiceRequestsAdminModule {}
