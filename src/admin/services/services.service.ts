import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from 'src/database/entities/service.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { User } from 'src/database/entities/user.entity'; // <-- Import User

@Injectable()
export class ServicesAdminService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  private checkAdminSociety(adminUser: User) {
    if (!adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }
  }

  async create(createDto: CreateServiceDto, adminUser: User): Promise<Service> {
    this.checkAdminSociety(adminUser);

    const existing = await this.servicesRepository.findOne({
      where: { name: createDto.name, society_id: adminUser.society_id },
    });

    if (existing) {
      throw new ConflictException(
        `A service with the name "${createDto.name}" already exists in your society.`,
      );
    }

    const newService = this.servicesRepository.create({
      ...createDto,
      society_id: adminUser.society_id,
    });
    return this.servicesRepository.save(newService);
  }

  async findAll(
    query: PaginationQueryDto,
    adminUser: User,
  ): Promise<PaginatedResponse<Service>> {
    this.checkAdminSociety(adminUser);

    const { limit, offset, search, sortBy, sortOrder } = query;
    const qb = this.servicesRepository.createQueryBuilder('service');

    // Filter by the admin's society first
    qb.where('service.society_id = :societyId', {
      societyId: adminUser.society_id,
    });

    if (search) {
      qb.andWhere('service.name ILIKE :search', { search: `%${search}%` });
    }

    const total = await qb.getCount();
    qb.orderBy(`service.${sortBy}`, sortOrder).offset(offset).limit(limit);

    const data = await qb.getMany();
    return new PaginatedResponse(data, total, limit, query.page);
  }

  async findOne(id: string, adminUser: User): Promise<Service> {
    this.checkAdminSociety(adminUser);
    const service = await this.servicesRepository.findOneBy({ id });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found.`);
    }
    // Security check: Ensure the service belongs to the admin's society
    if (service.society_id !== adminUser.society_id) {
      throw new ForbiddenException(
        'You do not have permission to access this service.',
      );
    }
    return service;
  }

  async update(
    id: string,
    updateDto: UpdateServiceDto,
    adminUser: User,
  ): Promise<Service> {
    const service = await this.findOne(id, adminUser); // Security check is included in findOne
    Object.assign(service, updateDto);
    return this.servicesRepository.save(service);
  }

  async remove(id: string, adminUser: User): Promise<void> {
    const service = await this.findOne(id, adminUser); // Security check is included in findOne
    await this.servicesRepository.remove(service);
  }
}
