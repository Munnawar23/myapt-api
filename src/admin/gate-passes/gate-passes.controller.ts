import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  GatePassStatus,
} from 'src/database/entities/gate-pass.entity';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { GatePassesAdminService } from './gate-passes.service';
import { GuardCreateGatePassDto } from './dto/guard-create-gate-pass.dto';
import { AdminGatePassFilterDto } from './dto/admin-gate-pass-filter.dto';

@ApiTags('Admin - Gate Pass Management')
@Controller('admin/gate-passes')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
export class GatePassesAdminController {
  constructor(private readonly gatePassesService: GatePassesAdminService) { }

  @Get('stats')
  @ApiOperation({ summary: 'Get gate pass statistics for reports' })
  @RequirePermission('view_gate_pass_reports')
  async getStats(
    @Req() req,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
    @Query('societyId') societyId?: string,
  ) {
    const isSuperAdmin = req.user.roles.some((r) => r.role_name === 'SUPERADMIN');
    // Managers can only see stats for their own society
    const targetSocietyId = isSuperAdmin ? societyId : req.user.society_id;
    return this.gatePassesService.getGatePassStats(targetSocietyId, period);
  }

  @Get('lookup/:passCode')
  @ApiOperation({ summary: 'Guard looks up a gate pass using its unique code' })
  @RequirePermission('lookup_gate_pass')
  findByPassCode(@Param('passCode') passCode: string) {
    return this.gatePassesService.findByPassCode(passCode);
  }

  @Get()
  @ApiOperation({ summary: 'Admin gets a paginated list of all gate passes' })
  @RequirePermission('view_all_gate_passes')
  findAllGatePasses(
    @Req() req,
    @Query() filterDto: AdminGatePassFilterDto,
  ) {
    const isSuperAdmin = req.user.roles.some((r) => r.role_name === 'SUPERADMIN');
    const targetSocietyId = isSuperAdmin ? filterDto.societyId : req.user.society_id;
    const statusArray = filterDto.status ? filterDto.status.split(',') : [];

    return this.gatePassesService.findAllGatePasses(
      { societyId: targetSocietyId, status: statusArray },
      filterDto,
    );
  }

  @Post(':id/status')
  @ApiOperation({ summary: 'Update gate pass status manually (e.g., set to WAIT_IN_LOBBY)' })
  @RequirePermission('create_guard_gate_pass') // Assuming guards who create can also update status
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: GatePassStatus,
  ) {
    return this.gatePassesService.updateStatus(id, status);
  }
}
