import {
  Controller,
  Get,
  Query,
  UseGuards,
  Put,
  Param,
  ParseUUIDPipe,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiProperty,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { ServiceRequestsAdminService } from './service-requests.service';
import { ServiceRequestAdminQueryDto } from './dto/service-request-admin-query.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';

@ApiTags('Admin - Service Request Management')
@Controller('admin/service-requests')
@UseGuards(PermissionGuard)
export class ServiceRequestsAdminController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsAdminService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'View and filter all service requests' })
  @RequirePermission('view_all_service_requests')
  @ApiBearerAuth()
  findAll(@Query() query: ServiceRequestAdminQueryDto) {
    return this.serviceRequestsService.findAll(query);
  }

  @Put(':id/assign-technician')
  @ApiOperation({ summary: 'Assign a technician to a service request' })
  @RequirePermission('assign_technician_to_service_request')
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
    @Body() technician_id: string,
  ) {
    return this.serviceRequestsService.assignTechnician(id, technician_id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update the status of a service request' })
  @RequirePermission('update_service_request_status')
  @ApiBearerAuth()
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateServiceRequestDto,
  ) {
    return this.serviceRequestsService.updateStatus(id, updateDto.status);
  }
}
