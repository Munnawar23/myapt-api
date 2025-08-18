import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Put,
  Param,
  ParseUUIDPipe,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@ApiTags('Staff (Tenant)')
@ApiBearerAuth()
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({ summary: "Add a new staff member for the tenant's flat" })
  create(@Req() req, @Body() createDto: CreateStaffDto) {
    const userId = req.user.id;
    return this.staffService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get a list of all staff members for the tenant's flat",
  })
  findAll(@Req() req) {
    const userId = req.user.id;
    return this.staffService.findAllForUser(userId);
  }

  @Put(':id')
  @ApiOperation({ summary: "Update a staff member's details" })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
    @Body() updateDto: UpdateStaffDto,
  ) {
    const userId = req.user.id;
    return this.staffService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a staff member' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const userId = req.user.id;
    return this.staffService.remove(id, userId);
  }
}
