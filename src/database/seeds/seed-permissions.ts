
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
    ];

    for (const perm of permissions) {
        try {
            // Check if permission exists first (inefficient but safe for seeding)
            // RbacService doesn't have findByName, so we rely on Unique constraint or try/catch.
            // We'll proceed with try/catch.
            await rbacService.createPermission({
                permission_name: perm.name,
                description: perm.description
            } as CreatePermissionDto);
            console.log(`Created permission: ${perm.name}`);
        } catch (e) {
            // Likely already exists
            console.log(`Permission ${perm.name} already exists or error:`, e.message);
        }
    }

    // 2. Assign Permissions to SUPERADMIN
    console.log('Assigning Permissions to SUPERADMIN...');
    const allRoles = await rbacService.findAllRoles();
    const superAdminRole = allRoles.find(r => r.role_name === 'SUPERADMIN');

    if (superAdminRole) {
        const allPermissions = await rbacService.findAllPermissions();

        for (const perm of allPermissions) {
            try {
                // Check if already assigned? RbacService.assignPermissionToRole adds to array.
                // We need to check existence to avoid duplicates if checks aren't in place.
                const rolePerms = await rbacService.findPermissionsForRole(superAdminRole.role_id);
                const hasPerm = rolePerms.find(p => p.permission_id === perm.permission_id);

                if (!hasPerm) {
                    await rbacService.assignPermissionToRole(superAdminRole.role_id, perm.permission_id);
                    console.log(`Assigned ${perm.permission_name} to SUPERADMIN`);
                } else {
                    console.log(`SUPERADMIN already has ${perm.permission_name}`);
                }
            } catch (e) {
                console.error(`Error assigning ${perm.permission_name}:`, e.message);
            }
        }
    } else {
        console.error('SUPERADMIN role not found!');
    }

    await app.close();
}

bootstrap();
