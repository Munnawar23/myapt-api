import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from 'src/database/entities/staff.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { StaffAdminController } from './staff.controller';
import { StaffAdminService } from './staff.service';
import { StaffLog } from 'src/database/entities/staff-log.entity';
import { User } from 'src/database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, User, StaffLog]), RbacModule],
  controllers: [StaffAdminController],
  providers: [StaffAdminService],
})
export class StaffAdminModule {}
