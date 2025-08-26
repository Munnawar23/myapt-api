import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Param,
  ParseUUIDPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveriesService } from './deliveries.service';
import { RespondToDeliveryDto } from './dto/respond-to-delivery.dto';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { DeliveryQueryDto } from './dto/delivery-query.dto';
import { UpdateDeliveryOtpDto } from './dto/update-delivery-otp.dto';

@ApiTags('Deliveries')
@ApiBearerAuth()
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) { }

  @Get('pending')
  @ApiOperation({
    summary: 'Get pending deliveries for the authenticated user',
  })
  @ApiBearerAuth()
  findPendingForUser(@Req() req) {
    const userId = req.user.id;
    return this.deliveriesService.findPendingForUser(userId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pre-register an expected delivery' })
  create(@Req() req, @Body() createDto: CreateDeliveryDto) {
    const userId = req.user.id;
    return this.deliveriesService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get delivery history for the authenticated user' })
  findForUser(@Req() req, @Query() query: DeliveryQueryDto) {
    // Use the DTO
    const userId = req.user.id;
    return this.deliveriesService.findForUser(userId, query);
  }

  @Post(':id/respond')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or deny a pending delivery' })
  respond(
    @Req() req,
    @Param('id', ParseUUIDPipe) deliveryId: string,
    @Body() respondDto: RespondToDeliveryDto,
  ) {
    const userId = req.user.id;
    return this.deliveriesService.respond(
      userId,
      deliveryId,
      respondDto.action,
      respondDto.otp,
    );
  }

  @Patch(':id/otp')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the OTP for an existing delivery' })
  async updateOtp(
    @Req() req,
    @Param('id', ParseUUIDPipe) deliveryId: string,
    @Body() updateOtpDto: UpdateDeliveryOtpDto,
  ) {
    const userId = req.user.id;
    return this.deliveriesService.updateDeliveryOtp(
      userId,
      deliveryId,
      updateOtpDto.otp,
    );
  }
}
