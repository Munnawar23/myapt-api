import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GatePass,
  GatePassStatus,
} from 'src/database/entities/gate-pass.entity';
import { Flat } from 'src/database/entities/flat.entity';
import { In, Repository, Between } from 'typeorm';
import { GuardCreateGatePassDto } from './dto/guard-create-gate-pass.dto';
import { customAlphabet } from 'nanoid';
import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class GatePassesAdminService {
  constructor(
    @InjectRepository(GatePass)
    private gatePassesRepository: Repository<GatePass>,
    @InjectRepository(Flat)
    private flatsRepository: Repository<Flat>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  private generatePassCode(): string {
    const alphabet = '0123456789';
    const nanoid = customAlphabet(alphabet, 10);
    return nanoid();
  }

  async createForApproval(
    guardId: string,
    createDto: GuardCreateGatePassDto,
  ): Promise<GatePass> {
    const guard = await this.usersRepository.findOne({
      where: { id: guardId },
    });
    if (!guard) throw new NotFoundException('Guard not found.');

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
      society_id: guard.society_id,
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

  async findAllGatePasses(
    queryBy: { societyId?: string; status?: string[] },
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<GatePass>> {
    const { limit, offset, search, sortBy, sortOrder } = query;

    const queryBuilder =
      this.gatePassesRepository.createQueryBuilder('gatepass');

    if (queryBy.societyId) {
      queryBuilder.andWhere('gatepass.society_id = :societyId', {
        societyId: queryBy.societyId,
      });
    }

    if (queryBy.status && queryBy.status.length > 0) {
      queryBuilder.andWhere('gatepass.status IN (:...status)', {
        status: queryBy.status,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(gatepass.visitor_name ILIKE :search OR gatepass.visitor_contact_number ILIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    const total = await queryBuilder.getCount();

    // Fix: GatePass entity doesn't have 'full_name'. 
    // If sortBy is 'full_name' (default), use 'createdAt'.
    const effectiveSortBy = sortBy === 'full_name' ? 'createdAt' : sortBy;
    const sortColumn = `gatepass.${effectiveSortBy}`;

    queryBuilder.orderBy(sortColumn, sortOrder);
    queryBuilder.offset(offset).limit(limit);

    const data = await queryBuilder.getMany();
    return new PaginatedResponse(data, total, limit, query.page);
  }

  async getGatePassStats(
    societyId?: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
  ) {
    const now = new Date();
    let startDate: Date;

    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'weekly') {
      // Last 7 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else {
      // Monthly: start of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const baseWhere: any = {
      createdAt: Between(startDate, now),
    };
    if (societyId) baseWhere.society_id = societyId;

    const totalCreated = await this.gatePassesRepository.count({
      where: baseWhere,
    });

    const activePasses = await this.gatePassesRepository.count({
      where: { ...baseWhere, status: GatePassStatus.ACTIVE },
    });

    const pendingApprovals = await this.gatePassesRepository.count({
      where: { ...baseWhere, status: GatePassStatus.PENDING_APPROVAL },
    });

    const visitorTypeBreakdown = await this.gatePassesRepository
      .createQueryBuilder('gp')
      .select('gp.visitor_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('gp.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: now,
      })
      .andWhere(societyId ? 'gp.society_id = :societyId' : '1=1', {
        societyId,
      })
      .groupBy('gp.visitor_type')
      .getRawMany();

    return {
      period,
      totalCreated,
      activePasses,
      pendingApprovals,
      visitorTypeBreakdown,
    };
  }

  async updateStatus(id: string, status: GatePassStatus): Promise<GatePass> {
    const pass = await this.gatePassesRepository.findOneBy({ id });
    if (!pass) throw new NotFoundException(`Gate Pass with ID ${id} not found.`);
    pass.status = status;
    return this.gatePassesRepository.save(pass);
  }
}
