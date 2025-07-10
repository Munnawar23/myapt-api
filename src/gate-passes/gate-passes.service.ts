import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GatePass } from 'src/database/entities/gate-pass.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateGatePassDto } from './dto/create-gate-pass.dto';
import { UpdateGatePassDto } from './dto/update-gate-pass.dto';

@Injectable()
export class GatePassesService {
  constructor(
    @InjectRepository(GatePass)
    private gatePassesRepository: Repository<GatePass>,
  ) {}

  async create(
    userId: string,
    createDto: CreateGatePassDto,
  ): Promise<GatePass> {
    const newGatePass = this.gatePassesRepository.create({
      requester_id: userId,
      guest_name: createDto.guest_name,
      guest_contact_number: createDto.guest_contact_number,
      visit_date: new Date(createDto.visit_date),
    });

    return this.gatePassesRepository.save(newGatePass);
  }

  async findForUser(userId: string): Promise<GatePass[]> {
    const findOptions: FindManyOptions<GatePass> = {
      where: {
        requester_id: userId,
      },
      order: {
        visit_date: 'DESC',
      },
    };
    return this.gatePassesRepository.find(findOptions);
  }

  async update(id: string, gatePassDto: UpdateGatePassDto): Promise<GatePass> {
    const gatepass = await this.gatePassesRepository.findOneBy({ id });

    if (!gatepass) {
      throw new NotFoundException(`Gate Pass with ID ${id} not found.`);
    }

    gatepass.status = gatePassDto.status;
    return this.gatePassesRepository.save(gatepass);
  }
}
