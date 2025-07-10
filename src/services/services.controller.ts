import { Controller, Get, Request } from '@nestjs/common'; // <-- Import Request
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({
    summary: "List all available personal services for the user's society",
  })
  findAll(@Request() req) {
    return this.servicesService.findAll(req.user);
  }
}
