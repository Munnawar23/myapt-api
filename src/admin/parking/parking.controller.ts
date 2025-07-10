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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ParkingAdminService } from './parking.service'; // Note: Service name might need adjustment if file name differs
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { CreateZoneDto } from './dto/create-zone.dto';
import { CreateSlotDto } from './dto/create-slot.dto';
import { AssignSlotDto } from './dto/assign-slot.dto';

@ApiTags('Admin - Parking Management')
@Controller('admin/parking')
@UseGuards(PermissionGuard)
export class ParkingAdminController {
  constructor(private readonly parkingService: ParkingAdminService) {}

  // == Zone Endpoints ==
  @Post('zones')
  @ApiOperation({ summary: 'Create a new parking zone' })
  @RequirePermission('manage_parking')
  @ApiBearerAuth()
  createZone(@Body() createDto: CreateZoneDto) {
    return this.parkingService.createZone(createDto);
  }

  @Get('zones')
  @ApiOperation({ summary: 'List all parking zones and their slots' })
  @RequirePermission('view_parking')
  @ApiBearerAuth()
  findAllZones() {
    return this.parkingService.findAllZones();
  }

  // == Slot Endpoints ==
  @Post('slots')
  @ApiOperation({ summary: 'Create a new parking slot within a zone' })
  @RequirePermission('manage_parking')
  @ApiBearerAuth()
  createSlot(@Body() createDto: CreateSlotDto) {
    return this.parkingService.createSlot(createDto);
  }

  @Get('slots')
  @ApiOperation({
    summary: 'List all parking slots, optionally filtered by zone',
  })
  @ApiQuery({
    name: 'zoneId',
    required: false,
    description: 'Filter slots by zone ID',
  })
  @RequirePermission('view_parking')
  @ApiBearerAuth()
  findAllSlots(@Query('zoneId') zoneId?: string) {
    return this.parkingService.findAllSlots(zoneId);
  }

  @Put('slots/:slotId/assign')
  @ApiOperation({ summary: 'Assign a parking slot to a user' })
  @RequirePermission('manage_parking')
  @ApiBearerAuth()
  assignSlot(
    @Param('slotId', ParseUUIDPipe) slotId: string,
    @Body() assignDto: AssignSlotDto,
  ) {
    return this.parkingService.assignSlot(slotId, assignDto.user_id);
  }

  @Put('slots/:slotId/unassign')
  @ApiOperation({ summary: 'Unassign a parking slot, making it available' })
  @RequirePermission('manage_parking')
  @ApiBearerAuth()
  unassignSlot(@Param('slotId', ParseUUIDPipe) slotId: string) {
    return this.parkingService.unassignSlot(slotId);
  }

  @Delete('slots/:slotId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a parking slot permanently' })
  @RequirePermission('manage_parking')
  @ApiBearerAuth()
  deleteSlot(@Param('slotId', ParseUUIDPipe) slotId: string) {
    return this.parkingService.deleteSlot(slotId);
  }
}
