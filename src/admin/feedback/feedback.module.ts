import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from 'src/database/entities/feedback.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { FeedbackAdminController } from './feedback.controller';
import { FeedbackAdminService } from './feedback.service';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback]), RbacModule],
  controllers: [FeedbackAdminController],
  providers: [FeedbackAdminService],
})
export class FeedbackAdminModule {}
