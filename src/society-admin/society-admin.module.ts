import { Module } from '@nestjs/common';
import { SocietyAdminService } from './society-admin.service';
import { SocietyAdminController } from './society-admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RbacModule],
  providers: [SocietyAdminService],
  controllers: [SocietyAdminController],
})
export class SocietyAdminModule {}
