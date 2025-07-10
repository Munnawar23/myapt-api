import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from 'src/database/entities/user.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { FamilyMember } from 'src/database/entities/family-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, FamilyMember]), RbacModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
