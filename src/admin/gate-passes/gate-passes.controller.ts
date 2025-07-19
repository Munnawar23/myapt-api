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
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { GatePassesAdminService } from './gate-passes.service';
import { GuardCreateGatePassDto } from './dto/guard-create-gate-pass.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('Admin - Gate Pass Management')
@Controller('admin/gate-passes')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
export class GatePassesAdminController {
  constructor(private readonly gatePassesService: GatePassesAdminService) {}

  @Post()
  @ApiOperation({
    summary: 'Guard generates a guest pass that requires tenant approval',
  })
  @RequirePermission('create_guard_gate_pass') // A specific permission for this action
  createForApproval(@Req() req, @Body() createDto: GuardCreateGatePassDto) {
    const guardId = req.user.id; // The logged-in user is the guard
    return this.gatePassesService.createForApproval(guardId, createDto);
  }

  @Get('lookup/:passCode')
  @ApiOperation({ summary: 'Guard looks up a gate pass using its unique code' })
  //   @RequirePermission('lookup_gate_pass') // New permission
  findByPassCode(@Param('passCode') passCode: string) {
    return this.gatePassesService.findByPassCode(passCode);
  }

  @Get()
  @ApiOperation({ summary: 'Admin gets a paginated list of all gate passes' })
  //   @RequirePermission('view_all_gate_passes') // New, more accurate permission name
  findAllGatePasses(@Query() query: PaginationQueryDto) {
    return this.gatePassesService.findAllGatePasses(query);
  }
}
