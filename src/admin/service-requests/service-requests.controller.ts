import {
  Controller,
  Get,
  Query,
  UseGuards,
  Put,
  Param,
  ParseUUIDPipe,
  Body,
  Post,
  Request,
  Delete,
  HttpCode,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { ServiceRequestsAdminService } from './service-requests.service';
import { ServiceRequestAdminQueryDto } from './dto/service-request-admin-query.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';

import { AdminCreateServiceRequestDto } from './dto/admin-create-service-request.dto';

@ApiTags('Admin - Service Request Management')
@Controller('admin/service-requests')
@UseGuards(PermissionGuard)
export class ServiceRequestsAdminController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsAdminService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'View and filter all service requests' })
  @RequirePermission('view_all_complaints')
  @ApiBearerAuth()
  findAll(@Request() req, @Query() query: ServiceRequestAdminQueryDto) {
    return this.serviceRequestsService.findAll(query, req.user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a complaint on behalf of a resident' })
  @RequirePermission('create_complaint')
  @ApiBearerAuth()
  create(@Request() req, @Body() createDto: AdminCreateServiceRequestDto) { // I'll use any or create a specific DTO if needed
    return this.serviceRequestsService.create(req.user, createDto);
  }

  @Put(':id/assign-technician')
  @ApiOperation({ summary: 'Assign a technician to a service request' })
  @RequirePermission('assign_complaint')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        technician_id: {
          type: 'string',
          format: 'uuid',
          example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        },
      },
      required: ['technician_id'],
    },
  })
  @ApiBearerAuth()
  assignTechnician(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('technician_id') technician_id: string,
    @Request() req,
  ) {
    return this.serviceRequestsService.assignTechnician(id, technician_id, req.user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service request (status, priority, comments)' })
  @RequirePermission('update_complaint_status')
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateServiceRequestDto,
    @Request() req,
  ) {
    return this.serviceRequestsService.update(id, updateDto, req.user);

  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service request permanently' })
  @RequirePermission('delete_complaint')
  @ApiBearerAuth()
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.serviceRequestsService.remove(id, req.user);
  }
}

