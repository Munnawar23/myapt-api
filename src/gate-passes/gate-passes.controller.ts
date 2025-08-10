import { Controller, Post, Body, Req, Get, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GatePassesService } from './gate-passes.service';
import { CreateGatePassDto } from './dto/create-gate-pass.dto';
import { UpdateGatePassDto } from './dto/update-gate-pass.dto';
import { RespondToPassDto } from './dto/respond-to-pass.dto';

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

  @Get('pending-approval')
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get passes awaiting the authenticated user's approval",
  })
  findPendingForUser(@Req() req) {
    const userId = req.user.id;
    return this.gatePassesService.findPendingForUser(userId);
  }

  @Post(':id/respond')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or deny a pending gate pass' })
  respond(
    @Param('id') id: string,
    @Req() req,
    @Body() respondDto: RespondToPassDto,
  ) {
    const userId = req.user.id;
    return this.gatePassesService.respond(id, userId, respondDto.action);
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
