import { Controller, Post, Body, Req, Get, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GatePassesService } from './gate-passes.service';
import { CreateGatePassDto } from './dto/create-gate-pass.dto';
import { UpdateGatePassDto } from './dto/update-gate-pass.dto';

@ApiTags('Gate Passes')
@Controller('gate-passes')
export class GatePassesController {
  constructor(private readonly gatePassesService: GatePassesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a guest pass' })
  create(@Req() req, @Body() createDto: CreateGatePassDto) {
    const userId = req.user.id;
    return this.gatePassesService.create(userId, createDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the authenticated user's gate pass history" })
  findForUser(@Req() req) {
    const userId = req.user.id;
    return this.gatePassesService.findForUser(userId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a gate pass' })
  update(@Param('id') id: string, @Body() updateDto: UpdateGatePassDto) {
    return this.gatePassesService.update(id, updateDto);
  }
}
