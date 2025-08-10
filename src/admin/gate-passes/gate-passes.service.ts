import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GatePass,
  GatePassStatus,
} from 'src/database/entities/gate-pass.entity';
import { Flat } from 'src/database/entities/flat.entity';
import { In, Repository } from 'typeorm';
import { GuardCreateGatePassDto } from './dto/guard-create-gate-pass.dto';
import { customAlphabet } from 'nanoid';
import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class GatePassesAdminService {
  constructor(
    @InjectRepository(GatePass)
    private gatePassesRepository: Repository<GatePass>,
    @InjectRepository(Flat)
    private flatsRepository: Repository<Flat>,
    // The Visitor repository is no longer needed here
  ) {}

  private generatePassCode(): string {
    const alphabet = '0123456789';
    const nanoid = customAlphabet(alphabet, 10);
    return nanoid();
  }

  async createForApproval(
    guardId: string,
    createDto: GuardCreateGatePassDto,
  ): Promise<GatePass> {
    const destinationFlats = await this.flatsRepository.find({
      where: { id: In(createDto.destination_flat_ids) },
    });
    if (destinationFlats.length !== createDto.destination_flat_ids.length) {
      throw new NotFoundException(
        'One or more destination flats were not found.',
      );
    }

    const newGatePass = this.gatePassesRepository.create({
      requester_id: guardId,
      pass_code: this.generatePassCode(),
      visitor_name: createDto.visitor_name,
      visitor_contact_number: createDto.visitor_contact_number,
      visitor_type: createDto.visitor_type,
      visit_purpose: createDto.visit_purpose,
      valid_from: new Date(createDto.valid_from),
      valid_until: new Date(createDto.valid_until),
      status: GatePassStatus.PENDING_APPROVAL,
      destination_flats: destinationFlats,
    });

    return this.gatePassesRepository.save(newGatePass);
  }

  async findByPassCode(passCode: string): Promise<GatePass> {
    const gatePass = await this.gatePassesRepository.findOne({
      where: { pass_code: passCode },
      relations: ['destination_flats', 'logs', 'requester'],
    });
    if (!gatePass)
      throw new NotFoundException(`Gate Pass with code ${passCode} not found.`);
    return gatePass;
  }

  // REVISED: This method now finds Gate Passes, not Visitors
  async findAllGatePasses(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<GatePass>> {
    const { limit, offset, search, sortBy, sortOrder } = query;

    const queryBuilder =
      this.gatePassesRepository.createQueryBuilder('gatepass');

    if (search) {
      // Allow searching by visitor name or mobile number, which are now in the gatepass table
      queryBuilder.where(
        '(gatepass.visitor_name ILIKE :search OR gatepass.visitor_contact_number ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    const total = await queryBuilder.getCount();
    const sortColumn = `gatepass.${sortBy}`;
    queryBuilder.orderBy(sortColumn, sortOrder);
    queryBuilder.offset(offset).limit(limit);

    const data = await queryBuilder.getMany();
    return new PaginatedResponse(data, total, limit, query.page);
  }
}
