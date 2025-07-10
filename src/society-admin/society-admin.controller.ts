import {
  Controller,
  Get,
  UseGuards,
  Request,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionGuard } from '../rbac/guards/permission/permission.guard';
import { RequirePermission } from '../rbac/decorators/permission.decorator';
import { SocietyAdminService } from './society-admin.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@ApiTags('Society Admin')
@ApiBearerAuth()
@UseGuards(PermissionGuard) // Protect all routes in this controller
@Controller('society-admin')
export class SocietyAdminController {
  constructor(private readonly societyAdminService: SocietyAdminService) {}

  @Get('pending-users')
  @RequirePermission('manage_society_members')
  @ApiOperation({
    summary: "Get list of users pending approval for the admin's society",
  })
  @ApiOkResponse({ description: 'List of pending users returned.' })
  @ApiForbiddenResponse({ description: 'Access denied.' })
  @ApiBearerAuth()
  getPendingUsers(@Request() req) {
    // The full user object is attached to 'req' by JwtStrategy
    const adminUser = req.user;
    return this.societyAdminService.getPendingUsers(adminUser);
  }

  @Patch('users/:userId/status')
  @RequirePermission('manage_society_members')
  @ApiOperation({ summary: 'Approve or reject a user for the society' })
  @ApiOkResponse({ description: "User's status updated successfully." })
  @ApiForbiddenResponse({ description: 'Access denied.' })
  @ApiBearerAuth()
  updateUserStatus(
    @Request() req,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    const adminUser = req.user;
    return this.societyAdminService.updateUserStatus(
      adminUser,
      userId,
      updateUserStatusDto.status,
    );
  }
}
