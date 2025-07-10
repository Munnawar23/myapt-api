import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Request, // <-- Import Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesAdminService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('Admin - Service Management')
@ApiBearerAuth()
@Controller('admin/services')
@UseGuards(PermissionGuard)
export class ServicesAdminController {
  constructor(private readonly servicesService: ServicesAdminService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new personal service for the admin's society",
  })
  @RequirePermission('create_service')
  create(@Body() createServiceDto: CreateServiceDto, @Request() req) {
    return this.servicesService.create(createServiceDto, req.user);
  }

  @Get()
  @ApiOperation({
    summary: "List all personal services for the admin's society",
  })
  @RequirePermission('view_services')
  findAll(@Query() query: PaginationQueryDto, @Request() req) {
    return this.servicesService.findAll(query, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single service by ID' })
  @RequirePermission('view_services')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.servicesService.findOne(id, req.user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service' })
  @RequirePermission('update_service')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Request() req,
  ) {
    return this.servicesService.update(id, updateServiceDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service' })
  @RequirePermission('delete_service')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.servicesService.remove(id, req.user);
    // Return a 204 No Content response on successful deletion
  }
}
