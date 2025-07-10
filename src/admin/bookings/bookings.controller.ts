import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { BookingsAdminService } from './bookings.service';
import { BookingAdminQueryDto } from './dto/booking-admin-query.dto';

@ApiTags('Admin - Booking Management')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('admin/bookings')
export class BookingsAdminController {
  constructor(private readonly bookingsService: BookingsAdminService) {}

  @Get()
  @ApiOperation({
    summary: "View a log of all amenity bookings for the admin's society",
  })
  @RequirePermission('view_all_bookings')
  findAll(@Query() query: BookingAdminQueryDto, @Request() req) {
    // Pass the authenticated admin user to the service
    return this.bookingsService.findAll(query, req.user);
  }
}
