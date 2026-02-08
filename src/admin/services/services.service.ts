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
  ) { }

  private checkAdminSociety(adminUser: User) {
    if (!adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }
  }

  async create(createDto: CreateServiceDto, adminUser: User): Promise<Service> {
    const isSuperAdmin = adminUser.roles.some((r) => r.role_name === 'SUPERADMIN');

    let societyId = adminUser.society_id;
    if (isSuperAdmin && createDto.society_id) {
      societyId = createDto.society_id;
    }

    if (!societyId) {
      throw new ForbiddenException('Society ID is required.');
    }

    const existing = await this.servicesRepository.findOne({
      where: { name: createDto.name, society_id: societyId },
    });

    if (existing) {
      throw new ConflictException(
        `A service with the name "${createDto.name}" already exists in this society.`,
      );
    }

    const newService = this.servicesRepository.create({
      ...(createDto as any),
      society_id: societyId,
    }) as any as Service;

    return this.servicesRepository.save(newService);

  }


  async findAll(
    query: any,
    adminUser: User,
  ): Promise<PaginatedResponse<Service>> {
    const isSuperAdmin = adminUser.roles.some((r) => r.role_name === 'SUPERADMIN');

    let { limit, offset, search, sortBy, sortOrder, society_id } = query;
    const qb = this.servicesRepository.createQueryBuilder('service');

    // Default sortBy for services should be 'name' not 'full_name'
    if (sortBy === 'full_name') {
      sortBy = 'name';
    }


    if (!isSuperAdmin) {
      this.checkAdminSociety(adminUser);
      qb.where('service.society_id = :societyId', {
        societyId: adminUser.society_id,
      });
    } else if (society_id) {
      qb.where('service.society_id = :societyId', { societyId: society_id });
    }

    if (search) {
      qb.andWhere('service.name ILIKE :search', { search: `%${search}%` });
    }

    const total = await qb.getCount();
    qb.orderBy(`service.${sortBy}`, sortOrder).offset(offset).limit(limit);

    const data = await qb.getMany();
    return new PaginatedResponse(data, total, limit, query.page);
  }


  async findOne(id: string, adminUser: User): Promise<Service> {
    const isSuperAdmin = adminUser.roles.some((r) => r.role_name === 'SUPERADMIN');

    const service = await this.servicesRepository.findOneBy({ id });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found.`);
    }

    if (!isSuperAdmin) {
      this.checkAdminSociety(adminUser);
      // Security check: Ensure the service belongs to the admin's society
      if (service.society_id !== adminUser.society_id) {
        throw new ForbiddenException(
          'You do not have permission to access this service.',
        );
      }
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
