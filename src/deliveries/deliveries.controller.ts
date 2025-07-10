import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveriesService } from './deliveries.service';
import { RespondToDeliveryDto } from './dto/respond-to-delivery.dto';

@ApiTags('Deliveries')
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get pending deliveries for the authenticated user',
  })
  @ApiBearerAuth()
  findForUser(@Req() req) {
    const userId = req.user.id;
    return this.deliveriesService.findForUser(userId);
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
    );
  }
}
