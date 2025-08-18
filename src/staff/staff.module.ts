import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from 'src/database/entities/staff.entity';
import { User } from 'src/database/entities/user.entity';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { RbacModule } from 'src/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, User]), // Add StaffLog
    RbacModule,
  ],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
