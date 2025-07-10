import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ParkingService } from './parking.service';
import { CreateParkingRequestDto } from './dto/create-parking-request.dto';

@ApiTags('Parking')
@Controller('parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get parking overview for the authenticated user' })
  @ApiBearerAuth()
  getOverview(@Req() req) {
    const userId = req.user.id;
    return this.parkingService.getOverview(userId);
  }

  @Post('requests')
  @ApiOperation({
    summary: 'Submit a parking change request or report an issue',
  })
  @ApiBearerAuth()
  createRequest(@Req() req, @Body() createDto: CreateParkingRequestDto) {
    const userId = req.user.id;
    return this.parkingService.createRequest(userId, createDto);
  }
}
