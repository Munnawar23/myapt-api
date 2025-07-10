import { Controller, Post, Body, Req, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { ServiceRequestQueryDto } from './dto/service-request-query.dto';

@ApiTags('Service Requests')
@ApiBearerAuth()
@Controller('service-requests')
export class ServiceRequestsController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Track the authenticated user's service requests" })
  findForUser(@Req() req, @Query() query: ServiceRequestQueryDto) {
    const userId = req.user.id;
    return this.serviceRequestsService.findForUser(userId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a new service request' })
  create(@Req() req, @Body() createDto: CreateServiceRequestDto) {
    // Pass the entire user object from the request to the service
    return this.serviceRequestsService.create(req.user, createDto);
  }
}
