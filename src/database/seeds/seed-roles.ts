
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { RbacService } from '../../rbac/rbac.service';
import { CreateRoleDto } from '../../rbac/dto/create-role.dto';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const rbacService = app.get(RbacService);

    const roles = ['SUPERADMIN', 'MANAGER', 'RECEPTIONIST', 'TENANT'];

    for (const roleName of roles) {
        try {
            // Check if role exists (we need to inspect the service to see if there is a 'findByName' or just iterate)
            // The RbacService doesn't have findByName exposed directly, but it has createRole which creates a new one.
            // We can use the repository directly if we inject it, OR we can rely on unique constraint failure or check all roles.
            // Let's verify existing roles first.

            const allRoles = await rbacService.findAllRoles();
            const exists = allRoles.find(r => r.role_name === roleName);

            if (!exists) {
                console.log(`Creating role: ${roleName}`);
                await rbacService.createRole({ role_name: roleName } as CreateRoleDto);
            } else {
                console.log(`Role already exists: ${roleName}`);
            }
        } catch (error) {
            console.error(`Error processing role ${roleName}:`, error);
        }
    }

    await app.close();
}

bootstrap();
