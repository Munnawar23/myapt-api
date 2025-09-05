import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { DeliveriesAdminService } from './deliveries.service';
import { GuardCreateDeliveryDto } from './dto/guard-create-delivery.dto';
import { SearchDeliveryDto } from './dto/search-delivery.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { DeliveryAction } from 'src/deliveries/dto/respond-to-delivery.dto';
import { DeliveryStatus } from 'src/database/entities/delivery.entity';

@ApiTags('Admin - Delivery Management')
@Controller('admin/deliveries')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
export class DeliveriesAdminController {
  constructor(private readonly deliveriesService: DeliveriesAdminService) { }

  @Post()
  @ApiOperation({
    summary: 'Guard registers a delivery that requires tenant approval',
  })
  @RequirePermission('create_guard_delivery') // New permission
  createForApproval(@Body() createDto: GuardCreateDeliveryDto) {
    return this.deliveriesService.createForApproval(createDto);
  }

  @RequirePermission("update_delivery_status")
  @Post('update-status')
  updateDeliveryStatus(@Body() deliveryId: string, deliveryStatus: DeliveryStatus) {
    return this.deliveriesService.updatedDeliveryStatus(deliveryId, deliveryStatus);
  }

  @Get()
  @ApiOperation({ summary: 'Admin gets a paginated list of all deliveries' })
  @RequirePermission('view_all_deliveries') // New permission
  findAll(@Query() query: PaginationQueryDto) {
    return this.deliveriesService.findAll(query);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Guard searches for a pre-registered delivery by Order ID',
  })
  @RequirePermission('search_delivery') // New permission
  findByOrderId(@Query() query: SearchDeliveryDto) {
    return this.deliveriesService.findByOrderId(query.order_id);
  }
}
