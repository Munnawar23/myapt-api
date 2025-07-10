import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AmenitiesAdminService } from './amenities.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';

@ApiTags('Admin - Amenity Management')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('admin/amenities')
export class AmenitiesAdminController {
  constructor(private readonly amenitiesService: AmenitiesAdminService) {}

  @Post()
  @RequirePermission('manage_amenities')
  @ApiOperation({ summary: "Create a new amenity for the admin's society" })
  @ApiCreatedResponse({
    description: 'The amenity has been successfully created.',
  })
  @ApiForbiddenResponse({ description: 'Permission denied.' })
  create(@Body() createAmenityDto: CreateAmenityDto, @Request() req) {
    console.log('createAmenityDto', createAmenityDto);
    return this.amenitiesService.create(createAmenityDto, req.user);
  }

  @Get()
  @RequirePermission('manage_amenities')
  @ApiOperation({ summary: "List all amenities for the admin's society" })
  @ApiOkResponse({ description: 'Returns a list of amenities.' })
  findAll(@Request() req) {
    return this.amenitiesService.findAll(req.user);
  }

  @Get(':id')
  @RequirePermission('manage_amenities')
  @ApiOperation({ summary: 'Get a single amenity by ID' })
  @ApiOkResponse({ description: 'Returns the amenity details.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.amenitiesService.findOne(id, req.user);
  }

  @Put(':id')
  @RequirePermission('manage_amenities')
  @ApiOperation({ summary: 'Update an existing amenity' })
  @ApiOkResponse({ description: 'The amenity has been successfully updated.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAmenityDto: UpdateAmenityDto,
    @Request() req,
  ) {
    return this.amenitiesService.update(id, updateAmenityDto, req.user);
  }

  @Delete(':id')
  @RequirePermission('manage_amenities')
  @ApiOperation({ summary: 'Delete an amenity' })
  @ApiOkResponse({ description: 'The amenity has been successfully deleted.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.amenitiesService.remove(id, req.user);
  }
}
