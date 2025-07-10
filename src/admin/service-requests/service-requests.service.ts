import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ServiceRequest,
  ServiceRequestStatus,
} from 'src/database/entities/service-request.entity';
import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { Repository } from 'typeorm';
import { ServiceRequestAdminQueryDto } from './dto/service-request-admin-query.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';

@Injectable()
export class ServiceRequestsAdminService {
  constructor(
    @InjectRepository(ServiceRequest)
    private serviceRequestsRepository: Repository<ServiceRequest>,
  ) {}

  // List all service requests with pagination and filtering
  async findAll(
    query: ServiceRequestAdminQueryDto,
  ): Promise<PaginatedResponse<ServiceRequest>> {
    const { limit, offset, search, status, sortBy, sortOrder } = query;

    const queryBuilder =
      this.serviceRequestsRepository.createQueryBuilder('request');
    queryBuilder.innerJoinAndSelect('request.user', 'user');
    queryBuilder.innerJoinAndSelect('request.service', 'service');

    if (search) {
      queryBuilder.where(
        '(user.full_name ILIKE :search OR service.name ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (status) {
      const whereMethod = search ? 'andWhere' : 'where';
      queryBuilder[whereMethod]('request.status = :status', { status });
    }

    const total = await queryBuilder.getCount();

    // Handle sorting
    let sortColumn = `request.${sortBy}`;
    if (sortBy === 'full_name') sortColumn = `user.full_name`;
    if (sortBy === 'name') sortColumn = `service.name`;
    queryBuilder.orderBy(sortColumn, sortOrder);

    queryBuilder.offset(offset).limit(limit);

    const data = await queryBuilder.getMany();
    return new PaginatedResponse(data, total, limit, query.page);
  }

  async assignTechnician(
    id: string,
    technician_id: string,
  ): Promise<ServiceRequest> {
    const request = await this.serviceRequestsRepository.findOneBy({ id: id });
    if (!request) {
      throw new NotFoundException(`Service Request with ID ${id} not found.`);
    }

    request.technician_id = technician_id;
    return this.serviceRequestsRepository.save(request);
  }

  // Update the status of a specific service request
  async updateStatus(
    id: string,
    status: ServiceRequestStatus,
  ): Promise<ServiceRequest> {
    const request = await this.serviceRequestsRepository.findOneBy({ id });
    if (!request) {
      throw new NotFoundException(`Service Request with ID ${id} not found.`);
    }

    request.status = status;
    return this.serviceRequestsRepository.save(request);
  }
}
