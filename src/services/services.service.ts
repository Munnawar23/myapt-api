import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from 'src/database/entities/service.entity';
import { User, UserSocietyStatus } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async findAll(user: User): Promise<Service[]> {
    if (!user.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }
    if (user.society_status !== UserSocietyStatus.APPROVED) {
      throw new ForbiddenException(
        'You must be an approved member to view services.',
      );
    }

    return this.servicesRepository.find({
      where: { society_id: user.society_id },
    });
  }
}
