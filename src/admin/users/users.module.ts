import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/database/entities/user.entity';
import { Flat } from 'src/database/entities/flat.entity';
import { FamilyMember } from 'src/database/entities/family-member.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { UsersAdminController } from './users.controller';
import { UsersAdminService } from './users.service';
import { Role } from 'src/database/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Flat, FamilyMember, Role]),
    RbacModule,
  ],
  controllers: [UsersAdminController],
  providers: [UsersAdminService],
})
export class UsersAdminModule {}
