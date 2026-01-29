
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { RbacService } from '../../rbac/rbac.service';
import * as fs from 'fs';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
    const rbacService = app.get(RbacService);

    let output = '--- Current Roles and Permissions ---\n';
    const roles = await rbacService.findAllRoles();

    for (const role of roles) {
        const permissions = await rbacService.findPermissionsForRole(role.role_id);
        const permissionNames = permissions.map(p => p.permission_name).join(', ');
        output += `Role: ${role.role_name} [${permissionNames || 'No permissions'}]\n`;
    }

    const allPermissions = await rbacService.findAllPermissions();
    output += '\n--- All Available Permissions ---\n';
    allPermissions.forEach(p => output += `- ${p.permission_name}\n`);

    fs.writeFileSync('permissions-report.txt', output);
    console.log('Report written to permissions-report.txt');

    await app.close();
}

bootstrap();
