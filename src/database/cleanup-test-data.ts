import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function cleanup() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const ds = app.get(DataSource);
    const queryRunner = ds.createQueryRunner();

    console.log('--- STARTING DATABASE CLEANUP ---');

    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        // 1. Find Superadmin IDs to preserve them
        const superAdmins = await ds.query(`
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.role_id 
      WHERE r.role_name = 'SUPERADMIN'
    `);
        const saIds = superAdmins.map((sa: any) => `'${sa.id}'`).join(',');

        console.log(`Preserving Superadmin IDs: ${saIds}`);

        // 2. Delete test data in order
        await queryRunner.query('DELETE FROM service_requests');
        await queryRunner.query('DELETE FROM services');
        await queryRunner.query('DELETE FROM amenity_bookings');
        await queryRunner.query('DELETE FROM amenity_slots');
        await queryRunner.query('DELETE FROM amenities');
        await queryRunner.query('DELETE FROM staff_logs');
        await queryRunner.query('DELETE FROM staff');
        await queryRunner.query('DELETE FROM feedback');
        await queryRunner.query('DELETE FROM announcements');
        await queryRunner.query('DELETE FROM flats');

        // 3. Delete non-superadmin user roles
        if (saIds) {
            await queryRunner.query(`DELETE FROM user_roles WHERE user_id NOT IN (${saIds})`);
            await queryRunner.query(`DELETE FROM users WHERE id NOT IN (${saIds})`);
        } else {
            console.warn('No Superadmins found! Skipping user deletion to avoid lockout.');
        }

        // 4. Delete societies
        await queryRunner.query('DELETE FROM societies');

        await queryRunner.commitTransaction();
        console.log('--- DATABASE CLEANUP SUCCESSFUL ---');
    } catch (err) {
        console.error('Error during cleanup:', err.message);
        await queryRunner.rollbackTransaction();
    } finally {
        await queryRunner.release();
        await app.close();
    }
}

cleanup();
