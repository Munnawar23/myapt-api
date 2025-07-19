import { Module } from '@nestjs/common';
import { GatePassesService } from './gate-passes.service';
import { GatePassesController } from './gate-passes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatePass } from '../database/entities/gate-pass.entity';
import { User } from 'src/database/entities/user.entity';

@Module({
  // Make both GatePass and User repositories available for injection
  imports: [TypeOrmModule.forFeature([GatePass, User])],
  controllers: [GatePassesController],
  providers: [GatePassesService],
})
export class GatePassesModule {}
