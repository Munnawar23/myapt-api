import { AddFamilyMemberDto } from './../admin/users/dto/add-family-member.dto';
// Add UseGuards to the imports from @nestjs/common
import {
  Controller,
  Get,
  Query,
  Delete,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { User } from 'src/database/entities/user.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { BulkDeleteDto } from 'src/common/dto/bulk-delete.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

// Change the tag and the controller's base path
@ApiTags('User Management')
@Controller('user')
// Apply guards to the entire controller
@UseGuards(PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiOperation({ summary: "Get the authenticated user's profile" })
  @ApiResponse({ status: 200, type: User })
  @ApiBearerAuth()
  async getProfile(@Req() req) {
    return await this.usersService.getFullProfile(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: "Update the authenticated user's profile" })
  @ApiResponse({ status: 200, type: User })
  @ApiBearerAuth()
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateProfileDto) {
    return await this.usersService.updateProfile(req.user.id, updateUserDto);
  }

  @Post('/family-members')
  @ApiOperation({ summary: "Add a family member to a user's flat" })
  @ApiResponse({ status: 201, type: User })
  @ApiBearerAuth()
  addFamilyMenber(@Req() Req, @Body() addDto: AddFamilyMemberDto) {
    return this.usersService.addFamilyMember(Req.user.id, addDto);
  }

  @Put('family-members/:memberId')
  @ApiOperation({ summary: "Update the authenticated user's family member" })
  @ApiResponse({ status: 200, type: User })
  @ApiBearerAuth()
  async updateFamilyMember(
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() addFamilyMemberDto: AddFamilyMemberDto,
  ) {
    return await this.usersService.updateFamilyMember(
      memberId,
      addFamilyMemberDto,
    );
  }

  @Post('fcm-update')
  @ApiOperation({ summary: "Update the authenticated user's FCM token" })
  @ApiResponse({ status: 200, type: User })
  @ApiBearerAuth()
  async updateFcmToken(@Req() req, @Body() fcmToken: string) {
    return await this.usersService.updateFcmToken(req.user.id, fcmToken);
  }

  @Delete('family-members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a family member' })
  @ApiBearerAuth()
  removeFamilyMember(@Param('memberId', ParseUUIDPipe) memberId: string) {
    return this.usersService.removeFamilyMember(memberId);
  }

  // This endpoint is now GET /admin/users
  // @Get()
  // @ApiOperation({ summary: 'Get a paginated list of all users' })
  // @ApiResponse({ status: 200, type: PaginatedResponse<User> })
  // @RequirePermission('view_all_users') // Permission to view the list
  // @ApiBearerAuth()
  // findAll(@Query() paginationQuery: PaginationQueryDto) {
  //   return this.usersService.findAll(paginationQuery);
  // }

  // This endpoint is now POST /admin/users/bulk-delete
  // @Post('bulk-delete')
  // @ApiOperation({ summary: 'Delete multiple users by their IDs' })
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @RequirePermission('delete_user') // Permission to delete users
  // bulkRemove(@Body() bulkDeleteDto: BulkDeleteDto<string>) {
  //   return this.usersService.bulkRemove(bulkDeleteDto.ids);
  // }

  // This endpoint is now DELETE /admin/users/:userId
  // @Delete(':userId')
  // @ApiOperation({ summary: 'Delete a user' })
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @RequirePermission('delete_user')
  // remove(@Param('userId') userId: string) {
  //   // Removed ParseUUIDPipe for now to simplify
  //   return this.usersService.remove(userId);
  // }
}
