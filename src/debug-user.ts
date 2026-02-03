
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RbacService } from './rbac/rbac.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const rbacService = app.get(RbacService);

    const userId = '840130ce-25e4-4690-95d9-4809bc4749f7'; // Update this if you have a specific ID, but I'll try to find a superadmin

    const users = await (rbacService as any).userRepository.find({ relations: ['roles', 'roles.permissions'] });
    for (const user of users) {
        console.log(`User: ${user.email} (ID: ${user.id})`);
        const perms = await rbacService.getUserPermissions(user.id);
        console.log(`Permissions: ${Array.from(perms).join(', ')}`);
        console.log('---');
    }

    await app.close();
}

bootstrap();
