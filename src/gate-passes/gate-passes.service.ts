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
import { PassAction } from './dto/respond-to-pass.dto';

@Injectable()
export class GatePassesService {
  constructor(
    @InjectRepository(GatePass)
    private gatePassesRepository: Repository<GatePass>,
    // We need the UserRepository to find the user's flat
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  private generatePassCode(): string {
    const alphabet = '0123456789';
    const nanoid = customAlphabet(alphabet, 10);
    return nanoid();
  }

  // Refactored 'create' method for users
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
      society_id: requester.society_id,
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

  async findPendingForUser(userId: string): Promise<GatePass[]> {
    // We need to find passes that are PENDING_APPROVAL and are destined for the user's flat.
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['owned_flat'],
    });

    if (!user || !user.owned_flat) {
      // If user has no flat, they can't have any pending passes.
      return [];
    }

    // Use QueryBuilder to find passes linked to the user's flat
    return this.gatePassesRepository
      .createQueryBuilder('gatepass')
      .innerJoin('gatepass.destination_flats', 'flat')
      .where('flat.id = :flatId', { flatId: user.owned_flat.id })
      .andWhere('gatepass.status = :status', {
        status: GatePassStatus.PENDING_APPROVAL,
      })
      .getMany();
  }

  // Method for a user to approve or deny a pass
  async respond(
    passId: string,
    userId: string,
    action: PassAction,
  ): Promise<GatePass> {
    const pass = await this.gatePassesRepository.findOne({
      where: { id: passId, status: GatePassStatus.PENDING_APPROVAL },
      relations: ['destination_flats'],
    });

    if (!pass) {
      throw new NotFoundException(
        `Pending gate pass with ID ${passId} not found.`,
      );
    }

    // Verify that this user is associated with one of the destination flats
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['owned_flat'],
    });

    const isAuthorized = pass.destination_flats.some(
      (flat) => flat.id === user?.owned_flat?.id,
    );

    if (!isAuthorized) {
      throw new ForbiddenException(
        'You are not authorized to respond to this gate pass.',
      );
    }

    // Update the status based on the action
    if (action === PassAction.APPROVE) {
      pass.status = GatePassStatus.ACTIVE;
      // As per our logic, the first user to approve makes the pass active.
      // We also update the requester to be the user who approved it.
      pass.requester_id = userId;
    } else {
      // action === PassAction.DENY
      pass.status = GatePassStatus.CANCELED; // Or a new 'DENIED' status if you prefer
    }

    return this.gatePassesRepository.save(pass);
  }

  // findForUser is now simpler as it doesn't need to join the visitor table
  async findForUser(userId: string): Promise<GatePass[]> {
    const findOptions: FindManyOptions<GatePass> = {
      where: { requester_id: userId },
      relations: ['destination_flats'],
      order: { createdAt: 'DESC' },
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
