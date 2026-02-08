

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Role } from '../entities/role.entity';
import { DataSource } from 'typeorm';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const roleRepository = dataSource.getRepository(Role);

    console.log('Resetting Database (Truncating all tables)...');

    // List all main tables. CASCADE will handle child tables like flats, bookings, etc.
    const tables = [
        'users',
        'societies',
        'roles',
        'permissions',
        'amenities',
        'announcements',
        'deliveries',
        'gate_passes',
        'invoices',
        'parking_zones',
        'payments',
        'services',
        'staff',
        'visitor_logs'
    ];

    for (const table of tables) {
        try {
            await dataSource.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
        } catch (error) {
            console.warn(`Could not truncate table ${table}: ${error.message}`);
        }
    }

    const roles = ['SUPERADMIN', 'MANAGER', 'RECEPTIONIST', 'USER', 'MC'];


    for (const roleName of roles) {
        try {
            console.log(`Creating role: ${roleName}`);
            const newRole = roleRepository.create({ role_name: roleName });
            await roleRepository.save(newRole);
        } catch (error) {
            console.error(`Error creating role ${roleName}:`, error);
        }
    }

    console.log('Roles seeded successfully.');
    await app.close();
}

bootstrap();

