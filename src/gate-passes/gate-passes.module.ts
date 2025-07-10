import { Module } from '@nestjs/common';
import { GatePassesService } from './gate-passes.service';
import { GatePassesController } from './gate-passes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatePass } from '../database/entities/gate-pass.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GatePass])],
  controllers: [GatePassesController],
  providers: [GatePassesService],
})
export class GatePassesModule {}
