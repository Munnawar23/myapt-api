
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { RbacService } from '../../rbac/rbac.service';
import { CreatePermissionDto } from '../../rbac/dto/create-permission.dto';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
    const rbacService = app.get(RbacService);

    console.log('Seeding Permissions...');

    // 1. Define Permissions to Create
    const permissions = [
        { name: 'create_society', description: 'Allows creation of new societies' },
        { name: 'view_societies', description: 'Allows viewing of societies' },
        { name: 'manage_users', description: 'General user management' },
        { name: 'create_user', description: 'Allows creating new users (admin/staff)' },
        { name: 'view_all_users', description: 'Allows viewing all users in society' },
        { name: 'update_user', description: 'Allows updating user details' },
        { name: 'delete_user', description: 'Allows deleting users' },
        { name: 'manage_roles', description: 'Allows management of roles and permissions' },
        { name: 'manage_flats', description: 'Allows management of flats' },
        { name: 'manage_amenities', description: 'Allows creation, editing, and deletion of amenities and generating slots' },
        { name: 'view_amenities', description: 'Allows viewing the list of amenities and their slots' },
        { name: 'control_amenity_slots', description: 'Allows enabling/disabling individual amenity slots' },
        { name: 'view_all_bookings', description: 'Allows viewing all amenity bookings' },
        { name: 'manage_society_members', description: 'Allows approving/rejecting new society members' },
        { name: 'manage_announcements', description: 'Full control over announcements (create, edit, delete, publish)' },
        { name: 'create_announcement_draft', description: 'Allows creating draft announcements only' },
        { name: 'manage_mc', description: 'Allows adding/removing users from Management Committee' },
    ];


    for (const perm of permissions) {
        try {
            await rbacService.createPermission({
                permission_name: perm.name,
                description: perm.description
            } as CreatePermissionDto);
            console.log(`Created permission: ${perm.name}`);
        } catch (e) {
            console.log(`Permission ${perm.name} already exists or error:`, e.message);
        }
    }

    // 2. Assign Permissions to Roles
    console.log('Assigning Permissions to Roles...');
    const allRoles = await rbacService.findAllRoles();
    const allPermissions = await rbacService.findAllPermissions();

    const superAdminRole = allRoles.find(r => r.role_name === 'SUPERADMIN');
    const managerRole = allRoles.find(r => r.role_name === 'MANAGER');
    const receptionistRole = allRoles.find(r => r.role_name === 'RECEPTIONIST');

    const assignPerm = async (roleId: number, permName: string) => {
        const perm = allPermissions.find(p => p.permission_name === permName);
        if (perm) {
            try {
                const rolePerms = await rbacService.findPermissionsForRole(roleId);
                const hasPerm = rolePerms.find(p => p.permission_id === perm.permission_id);
                if (!hasPerm) {
                    await rbacService.assignPermissionToRole(roleId, perm.permission_id);
                    console.log(`Assigned ${permName} to role.`);
                }
            } catch (e) {
                console.error(`Error assigning ${permName}:`, e.message);
            }
        }
    };

    // SUPERADMIN gets all
    if (superAdminRole) {
        for (const perm of allPermissions) {
            await assignPerm(superAdminRole.role_id, perm.permission_name);
        }
    }

    // MANAGER
    if (managerRole) {
        const managerPerms = ['create_user', 'delete_user', 'manage_users', 'view_all_users', 'update_user', 'manage_flats', 'manage_amenities', 'view_amenities', 'control_amenity_slots', 'view_all_bookings', 'manage_society_members', 'manage_announcements', 'create_announcement_draft', 'manage_mc'];
        for (const pname of managerPerms) {
            await assignPerm(managerRole.role_id, pname);
        }
    }


    // RECEPTIONIST
    if (receptionistRole) {
        const receptionistPerms = ['create_user', 'view_all_users', 'view_amenities', 'control_amenity_slots', 'view_all_bookings', 'create_announcement_draft'];
        for (const pname of receptionistPerms) {
            await assignPerm(receptionistRole.role_id, pname);
        }
    }


    await app.close();
}

bootstrap();
