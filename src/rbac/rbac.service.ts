import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from 'src/database/entities/role.entity';
import { Permission } from 'src/database/entities/permission.entity';
import { User } from 'src/database/entities/user.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  // --- Role Management ---
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { role_name, permissionIds } = createRoleDto;

    // 1. Prepare the new role entity with its name.
    const newRole = this.roleRepository.create({ role_name });

    // 2. If permissionIds are provided, find the corresponding permissions.
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: { permission_id: In(permissionIds) },
      });

      // Basic validation to ensure all provided IDs are valid
      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException(
          'One or more permission IDs were not found.',
        );
      }

      // 3. Assign the found permissions to the new role.
      newRole.permissions = permissions;
    }

    // 4. Save the new role. TypeORM will handle saving the role and its relationships in a transaction.
    return this.roleRepository.save(newRole);
  }

  // --- Permission Management ---
  async createPermission(permissionData: {
    permission_name: string;
    description?: string;
  }): Promise<Permission> {
    if (
      await this.permissionRepository.findOneBy({
        permission_name: permissionData.permission_name,
      })
    )
      throw new NotFoundException(
        `Permission with name ${permissionData.permission_name} already exists`,
      );
    const permission = this.permissionRepository.create(permissionData);
    return this.permissionRepository.save(permission);
  }

  // --- Assignment Logic ---
  async assignPermissionToRole(
    roleId: number,
    permissionId: number,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { role_id: roleId },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException(`Role with ID ${roleId} not found`);

    const permission = await this.permissionRepository.findOneBy({
      permission_id: permissionId,
    });
    if (!permission)
      throw new NotFoundException(
        `Permission with ID ${permissionId} not found`,
      );

    role.permissions.push(permission);
    return this.roleRepository.save(role);
  }

  async assignRoleToUser(userId: string, roleId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const role = await this.roleRepository.findOneBy({ role_id: roleId });
    if (!role) throw new NotFoundException(`Role with ID ${roleId} not found`);

    user.roles.push(role);
    return this.userRepository.save(user);
  }

  // --- THE CRITICAL METHOD, REWRITTEN ---
  async getUserPermissions(userId: string): Promise<Set<string>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      // This is TypeORM's equivalent of Sequelize's 'include'
      relations: ['roles', 'roles.permissions'],
    });

    const permissions = new Set<string>();
    if (user && user.roles) {
      user.roles.forEach((role) => {
        if (role.permissions) {
          role.permissions.forEach((permission) => {
            permissions.add(permission.permission_name);
          });
        }
      });
    }
    return permissions;
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  // --- Permission Management ---
  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async findRolesForUser(userId: string): Promise<Role[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    return user.roles;
  }

  async findPermissionsForRole(roleId: number): Promise<Permission[]> {
    const role = await this.roleRepository.findOne({
      where: { role_id: roleId },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException(`Role with ID ${roleId} not found`);
    return role.permissions;
  }

  async unassignRoleFromUser(userId: string, roleId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    // Filter out the role to be removed
    user.roles = user.roles.filter((role) => role.role_id !== roleId);
    await this.userRepository.save(user);
  }

  async removePermissionFromRole(
    roleId: number,
    permissionId: number,
  ): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { role_id: roleId },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException(`Role with ID ${roleId} not found`);

    role.permissions = role.permissions.filter(
      (p) => p.permission_id !== permissionId,
    );
    await this.roleRepository.save(role);
  }

  // --- Role Management ---
  async deleteRole(roleId: number): Promise<void> {
    // This will also remove associated entries in the join tables due to cascading
    const result = await this.roleRepository.delete(roleId);
    if (result.affected === 0) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
  }

  async bulkDeleteRoles(roleIds: number[]): Promise<void> {
    const result = await this.roleRepository.delete({
      role_id: In(roleIds),
    });

    if (result.affected === 0) {
      throw new NotFoundException(`No roles found with the provided IDs.`);
    }
  }

  async updateRole(
    roleId: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    // 1. Find the role to be updated.
    const role = await this.roleRepository.findOneBy({ role_id: roleId });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // 2. Update the role name if provided.
    if (updateRoleDto.role_name) {
      role.role_name = updateRoleDto.role_name;
    }

    // 3. Update permissions if an array of permissionIds is provided.
    if (updateRoleDto.permissionIds) {
      // Find all permission entities that match the given IDs.
      const permissions = await this.permissionRepository.find({
        where: { permission_id: In(updateRoleDto.permissionIds) },
      });

      // Simple validation: Ensure all provided IDs were found.
      if (permissions.length !== updateRoleDto.permissionIds.length) {
        throw new NotFoundException(
          'One or more permission IDs were not found.',
        );
      }

      // This completely overwrites the existing permissions for the role.
      role.permissions = permissions;
    }

    // 4. Save the updated role. TypeORM handles the relationship update in the join table.
    return this.roleRepository.save(role);
  }
}
