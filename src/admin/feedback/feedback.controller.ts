import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { FeedbackAdminService } from './feedback.service';

@ApiTags('Admin - Feedback Management')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('admin/feedback')
export class FeedbackAdminController {
  constructor(private readonly feedbackService: FeedbackAdminService) {}

  @Get()
  @ApiOperation({
    summary: "View and manage all feedback for the admin's society",
  })
  @RequirePermission('manage_feedback') // <-- Use new, consolidated permission
  findAll(@Query() query: PaginationQueryDto, @Request() req) {
    // Pass the admin user object to the service
    return this.feedbackService.findAll(query, req.user);
  }
}
