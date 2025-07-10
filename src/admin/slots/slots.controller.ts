import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { GenerateSlotsDto } from './dto/generate-slots.dto';
import { SlotsAdminService } from './slots.service';
import { UpdateSlotDto } from './dto/update-slot.dto';

@ApiTags('Admin - Amenity Slot Management')
@Controller('admin/amenities/:amenityId/slots') // Nested route for context
@UseGuards(PermissionGuard)
export class SlotsAdminController {
  constructor(private readonly slotsService: SlotsAdminService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generate time slots for an amenity for a given date range',
  })
  @RequirePermission('manage_amenity_slots')
  @ApiBearerAuth()
  generateSlots(
    @Param('amenityId', ParseUUIDPipe) amenityId: string,
    @Body() generateDto: GenerateSlotsDto,
  ) {
    return this.slotsService.generateSlots(amenityId, generateDto);
  }

  @Put(':slotId')
  @ApiOperation({ summary: 'Enable or disable a specific time slot' })
  @RequirePermission('manage_amenity_slots')
  @ApiBearerAuth()
  updateSlotStatus(
    @Param('slotId', ParseUUIDPipe) slotId: string,
    @Body() updateDto: UpdateSlotDto,
  ) {
    return this.slotsService.updateSlotStatus(slotId, updateDto.is_active);
  }
}
