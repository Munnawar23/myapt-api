import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatePass } from 'src/database/entities/gate-pass.entity';
import { Flat } from 'src/database/entities/flat.entity';
import { User } from 'src/database/entities/user.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { GatePassesAdminController } from './gate-passes.controller';
import { GatePassesAdminService } from './gate-passes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GatePass, Flat, User]),
    RbacModule,
  ],
  controllers: [GatePassesAdminController],
  providers: [GatePassesAdminService],
})
export class GatePassesAdminModule { }
