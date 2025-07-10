import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feedback } from 'src/database/entities/feedback.entity';
import { User, UserSocietyStatus } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async create(
    user: User, // <-- Change signature to accept the full User object
    createDto: CreateFeedbackDto,
  ): Promise<Feedback> {
    // Security check: User must be an approved member of a society to submit feedback
    if (
      !user.society_id ||
      user.society_status !== UserSocietyStatus.APPROVED
    ) {
      throw new ForbiddenException(
        'You must be an approved member of a society to submit feedback.',
      );
    }

    const newFeedback = this.feedbackRepository.create({
      ...createDto,
      user_id: user.id,
      society_id: user.society_id, // <-- Automatically set the society_id
    });

    return this.feedbackRepository.save(newFeedback);
  }
}
