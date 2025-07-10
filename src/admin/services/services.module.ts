import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from 'src/database/entities/service.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { ServicesAdminController } from './services.controller';
import { ServicesAdminService } from './services.service';

@Module({
  imports: [TypeOrmModule.forFeature([Service]), RbacModule],
  controllers: [ServicesAdminController],
  providers: [ServicesAdminService],
})
export class ServicesAdminModule {}
