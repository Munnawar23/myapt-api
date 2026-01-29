import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersAdminService } from './users.service';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AddFamilyMemberDto } from './dto/add-family-member.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';

@ApiTags('Admin - User Management')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('admin/users')
export class UsersAdminController {
  constructor(private readonly usersService: UsersAdminService) { }

  @Post()
  @ApiOperation({
    summary: "Create a new user (tenant, admin, etc.) for the admin's society",
  })
  @RequirePermission('create_user')
  create(@Body() createDto: CreateAdminUserDto, @Request() req) {
    return this.usersService.create(createDto, req.user);
  }

  @Get()
  @ApiOperation({
    summary: "Get a paginated list of all users in the admin's society",
  })
  @RequirePermission('view_all_users')
  findAll(@Query() query: UserQueryDto, @Request() req) {
    return this.usersService.findAll(query, req.user);
  }

  @Get(':userId')
  @ApiOperation({ summary: "Get a single user's full details by ID" })
  @RequirePermission('view_all_users')
  findOne(@Param('userId', ParseUUIDPipe) userId: string, @Request() req) {
    return this.usersService.findOneById(userId, req.user);
  }

  @Put(':userId')
  @ApiOperation({ summary: "Update a user's details" })
  @RequirePermission('update_user')
  update(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: AdminUpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.updateUser(userId, updateUserDto, req.user);
  }


  @Post(':userId/update-fcm-token')
  @ApiOperation({ summary: "Update a user's FCM token" })
  @RequirePermission('update_user')
  updateFcmToken(@Param('userId', ParseUUIDPipe) userId: string, @Body() fcmToken: string, @Request() req) {
    return this.usersService.updateFcmToken(userId, fcmToken, req.user.id);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' }) @RequirePermission('delete_user')
  remove(@Param('userId', ParseUUIDPipe) userId: string, @Request() req) {
    return this.usersService.removeUser(userId, req.user);
  }

  @Post(':userId/family-members')
  @ApiOperation({ summary: "Add a family member to a user's flat" })
  @RequirePermission('update_user')
  addFamilyMember(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() addDto: AddFamilyMemberDto,
    @Request() req,
  ) {
    return this.usersService.addFamilyMember(userId, addDto, req.user);
  }

  @Delete('family-members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a family member' })
  @RequirePermission('update_user')
  removeFamilyMember(@Param('memberId', ParseUUIDPipe) memberId: string) {
    // Note: This endpoint's security relies on the admin having access to the parent user.
    // A more robust implementation might check the society of the family member's flat.
    return this.usersService.removeFamilyMember(memberId);
  }
}
