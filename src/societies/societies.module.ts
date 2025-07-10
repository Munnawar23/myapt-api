import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocietiesController } from './societies.controller';
import { SocietiesService } from './societies.service';
import { Society } from '../database/entities/society.entity';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [TypeOrmModule.forFeature([Society]), RbacModule],
  controllers: [SocietiesController],
  providers: [SocietiesService],
  exports: [SocietiesService], // <-- EXPORT THE SERVICE
})
export class SocietiesModule {}
