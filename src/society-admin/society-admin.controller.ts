import {
  Controller,
  Get,
  UseGuards,
  Request,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
  Query,
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
  constructor(private readonly societyAdminService: SocietyAdminService) { }

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

  @Get('mc-members')
  @RequirePermission('view_all_users')

  @ApiOperation({
    summary:
      "Get a list of all Management Committee (MC) members. Super Admins can filter by query param 'societyId'.",
  })
  @ApiOkResponse({ description: 'List of MC members returned.' })
  @ApiForbiddenResponse({ description: 'Access denied.' })
  getMcMembers(@Request() req, @Query('societyId') societyId?: string) {
    const adminUser = req.user;
    return this.societyAdminService.getMcMembers(adminUser, societyId);
  }


  @Patch('users/:userId/mc/add')

  @RequirePermission('manage_mc')
  @ApiOperation({ summary: 'Add a user to the Management Committee (MC)' })
  @ApiOkResponse({ description: 'User added to MC.' })
  @ApiForbiddenResponse({ description: 'Access denied.' })
  addUserToMc(
    @Request() req,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const adminUser = req.user;
    return this.societyAdminService.addUserToMc(adminUser, userId);
  }

  @Patch('users/:userId/mc/remove')
  @RequirePermission('manage_mc')
  @ApiOperation({ summary: 'Remove a user from the Management Committee (MC)' })
  @ApiOkResponse({ description: 'User removed from MC.' })
  @ApiForbiddenResponse({ description: 'Access denied.' })
  removeUserFromMc(
    @Request() req,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const adminUser = req.user;
    return this.societyAdminService.removeUserFromMc(adminUser, userId);
  }
}

