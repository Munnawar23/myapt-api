import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from 'src/database/entities/invoice.entity';
import { User } from 'src/database/entities/user.entity';
import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesAdminService {
  constructor(
    @InjectRepository(Invoice) private invoicesRepository: Repository<Invoice>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  // List all invoices with pagination and filtering, scoped to the admin's society
  async findAll(
    query: PaginationQueryDto,
    adminUser: User,
  ): Promise<PaginatedResponse<Invoice>> {
    if (!adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }

    const { limit, offset, search, sortBy, sortOrder } = query;

    const queryBuilder = this.invoicesRepository.createQueryBuilder('invoice');
    queryBuilder.innerJoinAndSelect('invoice.user', 'user');

    // CRITICAL: Filter invoices by users belonging to the admin's society
    queryBuilder.where('user.society_id = :societyId', {
      societyId: adminUser.society_id,
    });

    if (search) {
      queryBuilder.andWhere(
        '(user.full_name ILIKE :search OR invoice.invoice_number ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();

    let sortColumn = `invoice.${sortBy}`;
    if (sortBy === 'full_name') sortColumn = `user.full_name`;
    queryBuilder.orderBy(sortColumn, sortOrder);

    queryBuilder.offset(offset).limit(limit);
    const data = await queryBuilder.getMany();
    return new PaginatedResponse(data, total, limit, query.page);
  }

  // Generate a new invoice for a resident, scoped to the admin's society
  async create(createDto: CreateInvoiceDto, adminUser: User): Promise<Invoice> {
    if (!adminUser.society_id) {
      throw new ForbiddenException(
        'You are not associated with any society to create an invoice.',
      );
    }

    // 1. Verify the target user exists
    const targetUser = await this.usersRepository.findOneBy({
      id: createDto.user_id,
    });
    if (!targetUser) {
      throw new NotFoundException(
        `User with ID ${createDto.user_id} not found.`,
      );
    }

    // 2. CRITICAL: Ensure the target user is in the same society as the admin
    if (targetUser.society_id !== adminUser.society_id) {
      throw new ForbiddenException(
        'You can only create invoices for users in your own society.',
      );
    }

    // 3. Generate a unique invoice number
    const timestamp = Date.now();
    const invoice_number = `INV-${timestamp}-${targetUser.id.substring(0, 4)}`;

    // 4. Create the new invoice
    const newInvoice = this.invoicesRepository.create({
      ...createDto,
      invoice_number,
      due_date: new Date(createDto.due_date),
    });

    return this.invoicesRepository.save(newInvoice);
  }
}
