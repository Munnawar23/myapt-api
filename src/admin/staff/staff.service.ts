import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from 'src/database/entities/staff.entity';
import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { StaffLog } from 'src/database/entities/staff-log.entity';
import { LogType } from 'src/database/entities/visitor-log.entity';

@Injectable()
export class StaffAdminService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(StaffLog)
    private staffLogsRepository: Repository<StaffLog>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<Staff>> {
    // --- THIS IS THE FIX ---
    // Ensure 'query' is a full instance of the DTO with defaults.
    // The ValidationPipe with transform: true should handle this, but this is a robust fallback.
    const finalQuery = Object.assign(new PaginationQueryDto(), query);
    const { limit, offset, search, sortBy, sortOrder } = finalQuery;
    // -----------------------

    const queryBuilder = this.staffRepository.createQueryBuilder('staff');
    queryBuilder.innerJoinAndSelect('staff.flat', 'flat');

    if (search) {
      queryBuilder.where(
        '(staff.full_name ILIKE :search OR flat.flat_number ILIKE :search) OR staff.contact_number ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();

    let sortColumn = `staff.${sortBy}`;
    if (sortBy === 'flat_number') {
      sortColumn = `flat.flat_number`;
    }
    queryBuilder.orderBy(sortColumn, sortOrder);

    // Use the 'offset' getter from the DTO instance
    queryBuilder.offset(offset).limit(limit);

    const data = await queryBuilder.getMany();
    return new PaginatedResponse(data, total, limit, finalQuery.page);
  }

  async logEntry(staffId: string): Promise<StaffLog> {
    // 1. Verify the staff member exists
    const staffMember = await this.staffRepository.findOneBy({ id: staffId });
    if (!staffMember) {
      throw new NotFoundException(`Staff with ID ${staffId} not found.`);
    }

    // (Optional future logic: Check if the staff member is already marked as 'IN')

    // 2. Create the new log entry
    const entryLog = this.staffLogsRepository.create({
      staff_id: staffId,
      log_type: LogType.ENTRY,
    });

    return this.staffLogsRepository.save(entryLog);
  }

  // Method to log a staff member's exit
  async logExit(staffId: string): Promise<StaffLog> {
    // 1. Verify the staff member exists
    const staffMember = await this.staffRepository.findOneBy({ id: staffId });
    if (!staffMember) {
      throw new NotFoundException(`Staff with ID ${staffId} not found.`);
    }

    // (Optional future logic: Check if the staff member is currently 'IN' before allowing exit)

    // 2. Create the new log entry
    const exitLog = this.staffLogsRepository.create({
      staff_id: staffId,
      log_type: LogType.EXIT,
    });

    return this.staffLogsRepository.save(exitLog);
  }
}
