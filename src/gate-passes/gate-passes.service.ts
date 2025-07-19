import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GatePass,
  GatePassStatus,
} from 'src/database/entities/gate-pass.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { CreateGatePassDto } from './dto/create-gate-pass.dto';
import { UpdateGatePassDto } from './dto/update-gate-pass.dto';
import { User } from 'src/database/entities/user.entity';
import { customAlphabet } from 'nanoid';

@Injectable()
export class GatePassesService {
  constructor(
    @InjectRepository(GatePass)
    private gatePassesRepository: Repository<GatePass>,
    // We need the UserRepository to find the user's flat
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private generatePassCode(): string {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nanoid = customAlphabet(alphabet, 10);
    return nanoid();
  }

  // Refactored 'create' method for tenants
  async create(
    userId: string,
    createDto: CreateGatePassDto,
  ): Promise<GatePass> {
    const requester = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['owned_flat'],
    });

    if (!requester)
      throw new NotFoundException(`User with ID ${userId} not found.`);
    if (!requester.owned_flat)
      throw new ForbiddenException(
        'You must be associated with a flat to create a gate pass.',
      );

    const newGatePass = this.gatePassesRepository.create({
      requester_id: userId,
      pass_code: this.generatePassCode(),
      // Visitor details are now part of the DTO and this entity
      visitor_name: createDto.visitor_name,
      visitor_contact_number: createDto.visitor_contact_number,
      visitor_type: createDto.visitor_type,
      visit_purpose: createDto.visit_purpose,
      valid_from: new Date(createDto.valid_from),
      valid_until: new Date(createDto.valid_until),
      status: GatePassStatus.ACTIVE,
      destination_flats: [requester.owned_flat],
    });

    return this.gatePassesRepository.save(newGatePass);
  }

  // findForUser is now simpler as it doesn't need to join the visitor table
  async findForUser(userId: string): Promise<GatePass[]> {
    const findOptions: FindManyOptions<GatePass> = {
      where: { requester_id: userId },
      relations: ['destination_flats'],
      order: { valid_from: 'DESC' },
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
