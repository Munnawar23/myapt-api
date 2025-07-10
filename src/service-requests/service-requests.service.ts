import {
  BadRequestException,
  ForbiddenException, // <-- Import ForbiddenException
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceRequest } from 'src/database/entities/service-request.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { Service } from 'src/database/entities/service.entity';
import { ServiceRequestQueryDto } from './dto/service-request-query.dto';
import { User, UserSocietyStatus } from 'src/database/entities/user.entity'; // <-- Import User and Enum

@Injectable()
export class ServiceRequestsService {
  constructor(
    @InjectRepository(ServiceRequest)
    private serviceRequestsRepository: Repository<ServiceRequest>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async create(
    user: User, // <-- Change signature to accept the full User object
    createDto: CreateServiceRequestDto,
  ): Promise<ServiceRequest> {
    const { service_id, start_time, end_time, additional_notes } = createDto;

    // --- NEW SECURITY VALIDATIONS ---
    // 1. Check if user is approved and part of a society
    if (
      !user.society_id ||
      user.society_status !== UserSocietyStatus.APPROVED
    ) {
      throw new ForbiddenException(
        'You must be an approved member of a society to request a service.',
      );
    }

    // 2. Check if the service exists
    const service = await this.servicesRepository.findOneBy({ id: service_id });
    if (!service) {
      throw new NotFoundException(`Service with ID ${service_id} not found.`);
    }

    // 3. The CRITICAL check: Does the service's society match the user's society?
    if (service.society_id !== user.society_id) {
      throw new ForbiddenException(
        'You cannot request a service that is not offered in your society.',
      );
    }
    // --- END of new validations ---

    const startTimeDate = new Date(start_time);
    const endTimeDate = new Date(end_time);
    if (endTimeDate <= startTimeDate) {
      throw new BadRequestException('End time must be after start time.');
    }

    const newRequest = this.serviceRequestsRepository.create({
      user_id: user.id, // <-- Use user.id
      service_id,
      additional_notes: additional_notes,
      start_time: startTimeDate,
      end_time: endTimeDate,
    });

    return this.serviceRequestsRepository.save(newRequest);
  }

  // findForUser is already secure by using userId and doesn't need changes
  async findForUser(
    userId: string,
    query: ServiceRequestQueryDto,
  ): Promise<ServiceRequest[]> {
    const findOptions: FindManyOptions<ServiceRequest> = {
      where: {
        user_id: userId,
      },
      relations: ['service'],
      order: {
        start_time: 'DESC',
      },
    };

    if (query.status) {
      (findOptions.where as any).status = query.status;
    }

    return this.serviceRequestsRepository.find(findOptions);
  }
}
