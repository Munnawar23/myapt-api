import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AmenitiesService } from './amenities.service';
import { SlotQueryDto } from './dto/slot-query.dto';

@ApiTags('Amenities')
@ApiBearerAuth()
@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Get()
  @ApiOperation({
    summary: "List all available amenities for the user's society",
  })
  findAll(@Request() req) {
    return this.amenitiesService.findAll(req.user);
  }

  @Get(':id/slots')
  @ApiOperation({
    summary: 'Get available time slots for a specific amenity on a given date',
  })
  findAvailableSlots(
    @Param('id', ParseUUIDPipe) amenityId: string,
    @Query() query: SlotQueryDto,
    @Request() req,
  ) {
    return this.amenitiesService.findAvailableSlots(
      amenityId,
      query.date,
      req.user,
    );
  }
}
