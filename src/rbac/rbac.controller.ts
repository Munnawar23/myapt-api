import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Get,
  Delete,
  Put,
} from '@nestjs/common';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBasicAuth,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from 'src/database/entities/role.entity';
import { Permission } from 'src/database/entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { User } from 'src/database/entities/user.entity';
import { Public } from 'src/auth/public.decorator';
import { BulkDeleteDto } from 'src/common/dto/bulk-delete.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('RBAC Management')
@Controller('admin/rbac')
@ApiBearerAuth()
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // --- Role Endpoints ---
  @Post('roles')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, type: Role })
  createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rbacService.createRole(createRoleDto);
  }

  // --- Permission Endpoints ---
  @Post('permissions')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, type: Permission })
  createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    return this.rbacService.createPermission(createPermissionDto);
  }

  // --- Assignment Endpoints ---
  @Post('roles/:roleId/permissions')
  @ApiOperation({ summary: 'Assign a permission to a role' })
  @ApiResponse({ status: 200, description: 'Permission assigned.' })
  @HttpCode(HttpStatus.OK)
  assignPermission(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() assignPermissionDto: AssignPermissionDto,
  ): Promise<Role> {
    return this.rbacService.assignPermissionToRole(
      roleId,
      assignPermissionDto.permissionId,
    );
  }

  @Post('users/:userId/roles')
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({ status: 200, description: 'Role assigned.' })
  @HttpCode(HttpStatus.OK)
  @Public()
  assignRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() assignRoleDto: AssignRoleDto,
  ): Promise<User> {
    return this.rbacService.assignRoleToUser(userId, assignRoleDto.roleId);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get a list of all roles' })
  findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  // --- Permission Endpoints ---
  @Get('permissions')
  @ApiOperation({ summary: 'Get a list of all permissions' })
  findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @Get('users/:userId/roles')
  @ApiOperation({ summary: 'Get roles assigned to a specific user' })
  findRolesForUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.rbacService.findRolesForUser(userId);
  }

  @Get('roles/:roleId/permissions')
  @ApiOperation({ summary: 'Get permissions assigned to a specific role' })
  findPermissionsForRole(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.rbacService.findPermissionsForRole(roleId);
  }

  @Put('roles/:roleId')
  @ApiOperation({
    summary: "Update a role's name and/or its assigned permissions",
  })
  @ApiResponse({
    status: 200,
    description: 'Role successfully updated.',
    type: Role,
  })
  updateRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rbacService.updateRole(roleId, updateRoleDto);
  }

  @Delete('users/:userId/roles/:roleId')
  @ApiOperation({ summary: 'Un-assign a role from a user' })
  @HttpCode(HttpStatus.NO_CONTENT)
  unassignRoleFromUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.rbacService.unassignRoleFromUser(userId, roleId);
  }

  @Post('roles/bulk-delete')
  @ApiOperation({ summary: 'Delete multiple roles by their IDs' })
  @HttpCode(HttpStatus.NO_CONTENT)
  // Optionally add a permission check here
  bulkDeleteRoles(@Body() bulkDeleteDto: BulkDeleteDto<number>) {
    return this.rbacService.bulkDeleteRoles(bulkDeleteDto.ids);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removePermissionFromRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.rbacService.removePermissionFromRole(roleId, permissionId);
  }

  // --- Role Endpoints ---
  @Delete('roles/:roleId')
  @ApiOperation({ summary: 'Delete a role' })
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteRole(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.rbacService.deleteRole(roleId);
  }
}
