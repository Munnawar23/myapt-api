import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ServiceRequest,
  ServiceRequestStatus,
  ServiceRequestPriority,
} from '../../database/entities/service-request.entity';

import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { Repository } from 'typeorm';
import { ServiceRequestAdminQueryDto } from './dto/service-request-admin-query.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { User } from 'src/database/entities/user.entity';
import { AdminCreateServiceRequestDto } from './dto/admin-create-service-request.dto';

@Injectable()
export class ServiceRequestsAdminService {
  constructor(
    @InjectRepository(ServiceRequest)
    private serviceRequestsRepository: Repository<ServiceRequest>,
  ) { }

  // List all service requests with pagination and filtering
  async findAll(
    query: ServiceRequestAdminQueryDto,
    adminUser: User,
  ): Promise<PaginatedResponse<ServiceRequest>> {
    const { limit, offset, search, status, sortBy, sortOrder } = query;
    const isSuperAdmin = adminUser.roles.some((r) => r.role_name === 'SUPERADMIN');

    const queryBuilder =
      this.serviceRequestsRepository.createQueryBuilder('request');
    queryBuilder.innerJoinAndSelect('request.user', 'user');
    queryBuilder.innerJoinAndSelect('request.service', 'service');

    // Society filtering
    if (!isSuperAdmin) {
      if (!adminUser.society_id) {
        throw new ForbiddenException('You are not associated with any society.');
      }
      queryBuilder.andWhere('service.society_id = :societyId', {
        societyId: adminUser.society_id,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.full_name ILIKE :search OR service.name ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (status) {
      queryBuilder.andWhere('request.status = :status', { status });
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

  async create(
    adminUser: User,
    createDto: AdminCreateServiceRequestDto,
  ): Promise<ServiceRequest> {
    const isSuperAdmin = adminUser.roles.some(
      (r) => r.role_name === 'SUPERADMIN',
    );
    if (isSuperAdmin) {
      throw new ForbiddenException(
        'Super Admins cannot create service requests directly.',
      );
    }

    const newRequest = this.serviceRequestsRepository.create({
      ...createDto,
      status: ServiceRequestStatus.OPEN,
    });

    return this.serviceRequestsRepository.save(newRequest);
  }

  async assignTechnician(
    id: string,
    technician_id: string,
    adminUser: User,
  ): Promise<ServiceRequest> {
    const isSuperAdmin = adminUser.roles.some(
      (r) => r.role_name === 'SUPERADMIN',
    );
    if (isSuperAdmin) {
      throw new ForbiddenException('Super Admins cannot assign technicians.');
    }

    const request = await this.serviceRequestsRepository.findOneBy({ id: id });
    if (!request) {
      throw new NotFoundException(`Service Request with ID ${id} not found.`);
    }

    request.technician_id = technician_id;
    if (request.status === ServiceRequestStatus.OPEN) {
      request.status = ServiceRequestStatus.IN_PROGRESS;
    }
    return this.serviceRequestsRepository.save(request);
  }

  async update(
    id: string,
    updateDto: UpdateServiceRequestDto,
    adminUser: User,
  ): Promise<ServiceRequest> {
    const isSuperAdmin = adminUser.roles.some(
      (r) => r.role_name === 'SUPERADMIN',
    );
    if (isSuperAdmin) {
      throw new ForbiddenException(
        'Super Admins cannot update service requests.',
      );
    }

    const isReceptionist = adminUser.roles.some(
      (r) => r.role_name === 'RECEPTIONIST',
    );

    const request = await this.serviceRequestsRepository.findOneBy({ id });
    if (!request) {
      throw new NotFoundException(`Service Request with ID ${id} not found.`);
    }

    // Role-based restrictions for Receptionist
    if (isReceptionist) {
      if (updateDto.priority) {
        throw new ForbiddenException('Receptionists cannot change priority.');
      }
    }

    if (updateDto.status) {
      request.status = updateDto.status;
      // Automatically set end_time when resolved
      if (updateDto.status === ServiceRequestStatus.RESOLVED) {
        request.end_time = new Date();
      }
    }
    if (updateDto.priority) request.priority = updateDto.priority;
    if (updateDto.admin_comments)
      request.admin_comments = updateDto.admin_comments;

    await this.serviceRequestsRepository.save(request);


    // Fetch full entity after save to ensure all fields are returned
    return (await this.serviceRequestsRepository.findOne({
      where: { id },
      relations: ['user', 'service', 'assigned_technician'],
    })) as ServiceRequest;
  }
  async remove(id: string, adminUser: User): Promise<void> {
    const isSuperAdmin = adminUser.roles.some((r) => r.role_name === 'SUPERADMIN');

    const request = await this.serviceRequestsRepository.findOne({
      where: { id },
      relations: ['service'],
    });

    if (!request) {
      throw new NotFoundException(`Service Request with ID ${id} not found.`);
    }

    if (!isSuperAdmin) {
      if (request.service.society_id !== adminUser.society_id) {
        throw new ForbiddenException(
          'You do not have permission to delete this complaint.',
        );
      }
    }

    await this.serviceRequestsRepository.remove(request);
  }
}
