import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { AnnouncementsAdminService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@ApiTags('Admin - Announcement Management')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('admin/announcements')
export class AnnouncementsAdminController {
  constructor(
    private readonly announcementsService: AnnouncementsAdminService,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Create and publish a new announcement for the admin's society",
  })
  @RequirePermission('manage_announcements')
  create(@Body() createDto: CreateAnnouncementDto, @Request() req) {
    return this.announcementsService.create(createDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: "List all announcements for the admin's society" })
  @ApiOkResponse({ description: 'Returns a list of announcements.' })
  @ApiForbiddenResponse({ description: 'Permission denied.' })
  @RequirePermission('manage_announcements')
  findAll(@Request() req) {
    return this.announcementsService.findAll(req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an announcement' })
  @ApiOkResponse({ description: 'Announcement deleted successfully.' })
  @ApiForbiddenResponse({ description: 'Permission denied.' })
  @RequirePermission('manage_announcements')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.announcementsService.remove(id, req.user);
  }
}
