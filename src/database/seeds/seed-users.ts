
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

    // 1. Ensure Society Exists
    let society = await societyRepository.findOneBy({ name: 'My Apartment Complex' });
    if (!society) {
        console.log('Creating default Society...');
        society = societyRepository.create({
            name: 'My Apartment Complex',
            address: '123 Developer Lane, Code City',
        });
        society = await societyRepository.save(society);
        console.log(`Society Created: ${society.id}`);
    } else {
        console.log(`Using existing Society: ${society.id}`);
    }

    // 2. Define Users to Create
    const usersToCreate = [
        {
            email: 'superadmin@example.com',
            full_name: 'Super Admin User',
            role: 'SUPERADMIN',
        },
        {
            email: 'manager@example.com',
            full_name: 'Manager User',
            role: 'MANAGER',
        },
        {
            email: 'receptionist@example.com',
            full_name: 'Receptionist User',
            role: 'RECEPTIONIST',
        },
        {
            email: 'tenant@example.com',
            full_name: 'Tenant User',
            role: 'TENANT',
        },
    ];

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash('123456', salt);

    for (const userData of usersToCreate) {
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
            society: society,
            society_status: UserSocietyStatus.APPROVED, // Auto-approve
            roles: [role],
        });

        await userRepository.save(newUser);
        console.log(`Created ${userData.full_name} (${userData.role})`);
    }

    console.log('Seeding Complete!');
    await app.close();
}

bootstrap();
