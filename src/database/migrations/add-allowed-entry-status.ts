import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
    const dataSource = app.get(DataSource);

    console.log('Adding ALLOWED_ENTRY to gate_passes_status_enum...');

    try {
        await dataSource.query(`
      ALTER TYPE gate_passes_status_enum ADD VALUE IF NOT EXISTS 'ALLOWED_ENTRY';
    `);
        console.log('✅ Successfully added ALLOWED_ENTRY status to database enum');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    await app.close();
}

bootstrap();
