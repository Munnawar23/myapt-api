import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function fix() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const ds = app.get(DataSource);
    console.log('--- STARTING ENUM UPDATE ---');
    try {
        // Add all required status values to the Postgres ENUM
        await ds.query("ALTER TYPE service_requests_status_enum ADD VALUE IF NOT EXISTS 'OPEN'");
        await ds.query("ALTER TYPE service_requests_status_enum ADD VALUE IF NOT EXISTS 'IN_PROGRESS'");
        await ds.query("ALTER TYPE service_requests_status_enum ADD VALUE IF NOT EXISTS 'RESOLVED'");
        await ds.query("ALTER TYPE service_requests_status_enum ADD VALUE IF NOT EXISTS 'CLOSED'");
        await ds.query("ALTER TYPE service_requests_status_enum ADD VALUE IF NOT EXISTS 'CANCELED'");

        // Also fix priority enum just in case
        await ds.query("ALTER TYPE service_requests_priority_enum ADD VALUE IF NOT EXISTS 'LOW'");
        await ds.query("ALTER TYPE service_requests_priority_enum ADD VALUE IF NOT EXISTS 'MEDIUM'");
        await ds.query("ALTER TYPE service_requests_priority_enum ADD VALUE IF NOT EXISTS 'HIGH'");
        await ds.query("ALTER TYPE service_requests_priority_enum ADD VALUE IF NOT EXISTS 'URGENT'");

        console.log('--- ENUMS UPDATED SUCCESSFULLY ---');
    } catch (err) {
        console.error('Error updating enums:', err.message);
    } finally {
        await app.close();
    }
}
fix();
