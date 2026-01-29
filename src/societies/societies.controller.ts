// ... imports
import { Controller, Post, UseGuards, Body, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Public } from 'src/auth/public.decorator'; // Corrected path
import { Society } from 'src/database/entities/society.entity';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { CreateSocietyDto } from './dto/create-society.dto';
import { SocietiesService } from './societies.service';

@ApiTags('Societies')
@Controller('societies')
export class SocietiesController {
  constructor(private readonly societiesService: SocietiesService) { }

  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermission('create_society')
  @ApiOperation({ summary: 'Create a new society (Super Admin only)' })
  @ApiCreatedResponse({
    description: 'The society has been successfully created.',
    type: Society,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized or missing permission.',
  })
  @ApiConflictResponse({
    description: 'Society with this name already exists.',
  })
  @ApiBearerAuth()
  create(@Body() createSocietyDto: CreateSocietyDto) {
    return this.societiesService.create(createSocietyDto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get a list of all available societies for registration',
  })
  @ApiOkResponse({
    description: 'Returns an array of societies with basic info.',
    type: [Society],
  })
  findAll() {
    // Point to the new, clearly named public method
    return this.societiesService.findAllPublic();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific society by ID' })
  @ApiOkResponse({
    description: 'Returns the details of a specific society.',
    type: Society,
  })
  findOne(@Param('id') id: string) {
    return this.societiesService.findOneById(id);
  }
}
