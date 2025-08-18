import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { StaffAdminService } from './staff.service';

@ApiTags('Admin - Staff Management')
@Controller('admin/staff')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
export class StaffAdminController {
  constructor(private readonly staffService: StaffAdminService) {}

  @Get()
  @ApiOperation({
    summary: 'Search for staff by name or flat number or contact number',
  })
  @RequirePermission('view_all_staff') // New permission
  findAll(@Query() query: PaginationQueryDto) {
    return this.staffService.findAll(query);
  }

  @Post(':id/log-entry')
  @ApiOperation({ summary: "Guard logs a staff member's entry" })
  @RequirePermission('log_staff_entry') // New permission
  logEntry(@Param('id', ParseUUIDPipe) id: string) {
    return this.staffService.logEntry(id);
  }

  @Post(':id/log-exit')
  @ApiOperation({ summary: "Guard logs a staff member's exit" })
  @RequirePermission('log_staff_exit') // New permission
  logExit(@Param('id', ParseUUIDPipe) id: string) {
    return this.staffService.logExit(id);
  }
}
