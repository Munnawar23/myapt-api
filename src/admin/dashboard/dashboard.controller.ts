import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: "Get statistics for the admin's society dashboard" })
  @RequirePermission('view_admin_dashboard')
  getStats(@Request() req) {
    // Pass the authenticated admin user to the service
    return this.dashboardService.getStats(req.user);
  }
}
