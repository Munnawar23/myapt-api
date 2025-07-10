import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feedback } from 'src/database/entities/feedback.entity';
import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FeedbackAdminService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async findAll(
    query: PaginationQueryDto,
    adminUser: User, // <-- Accept the admin user object
  ): Promise<PaginatedResponse<Feedback>> {
    if (!adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }

    const { limit, offset, search, sortBy, sortOrder } = query;

    const queryBuilder = this.feedbackRepository.createQueryBuilder('feedback');
    queryBuilder.innerJoinAndSelect('feedback.user', 'user');

    // CRITICAL: Filter feedback by the admin's society
    queryBuilder.where('feedback.society_id = :societyId', {
      societyId: adminUser.society_id,
    });

    if (search) {
      queryBuilder.andWhere(
        '(user.full_name ILIKE :search OR feedback.comment ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();

    let sortColumn = `feedback.${sortBy}`;
    if (sortBy === 'full_name') sortColumn = `user.full_name`;
    queryBuilder.orderBy(sortColumn, sortOrder);

    queryBuilder.offset(offset).limit(limit);
    const data = await queryBuilder.getMany();
    return new PaginatedResponse(data, total, limit, query.page);
  }
}
