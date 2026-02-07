
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { User, UserSocietyStatus } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Society } from '../entities/society.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);
    const societyRepository = dataSource.getRepository(Society);

    console.log('Seeding Database...');

    // 2. Define Users to Create
    const usersToCreate = [
        {
            email: 'rajat@myapt.com',
            full_name: 'Super Admin',
            role: 'SUPERADMIN',
            password: 'Myapt@123'
        }
    ];

    for (const userData of usersToCreate) {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(userData.password, salt);


        const existingUser = await userRepository.findOne({
            where: { email: userData.email },
            relations: ['roles'],
        });

        if (existingUser) {
            console.log(`User ${userData.email} already exists. Skipping.`);
            continue;
        }

        const role = await roleRepository.findOneBy({ role_name: userData.role });
        if (!role) {
            console.error(`Role ${userData.role} not found! Please run seed:roles first.`);
            continue;
        }

        console.log(`Creating user: ${userData.email}`);
        const newUser = userRepository.create({
            email: userData.email,
            full_name: userData.full_name,
            password_hash: passwordHash,
            phone_number: '1234567890',
            roles: [role],
        });


        await userRepository.save(newUser);
        console.log(`Created ${userData.full_name} (${userData.role}) with password: ${userData.password}`);
    }

    console.log('Seeding Complete!');
    await app.close();
}

bootstrap();

