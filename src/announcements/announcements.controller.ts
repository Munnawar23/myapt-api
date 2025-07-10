import { Controller, Get, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from 'src/database/entities/announcement.entity';

@ApiTags('Announcements')
@ApiBearerAuth()
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @ApiOperation({ summary: "View all announcements for the user's society" })
  @ApiOkResponse({
    description: 'A list of society announcements.',
    type: [Announcement],
  })
  findAll(@Request() req) {
    return this.announcementsService.findAllForUser(req.user);
  }
}
