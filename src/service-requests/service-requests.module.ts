import { Module } from '@nestjs/common';
import { ServiceRequestsService } from './service-requests.service';
import { ServiceRequestsController } from './service-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequest } from 'src/database/entities/service-request.entity';
import { Service } from 'src/database/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest, Service])],
  controllers: [ServiceRequestsController],
  providers: [ServiceRequestsService],
  exports: [ServiceRequestsService],
})
export class ServiceRequestsModule {}
