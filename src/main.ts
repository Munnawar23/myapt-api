import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Import Swagger modules

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173', // Your React app's origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away properties that are not defined in the DTO
      forbidNonWhitelisted: true, // Throws an error if unknown properties are sent
      transform: true,
    }),
  );

  // --- Swagger Configuration ---
  const config = new DocumentBuilder()
    .setTitle('Dynamic RBAC API')
    .setDescription(
      'API documentation for the dynamic role-based access control system',
    )
    .setVersion('1.0')
    .addTag('RBAC Management', 'Endpoints for managing roles and permissions')
    .addTag('Users', 'Endpoints for managing users')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // Serve Swagger UI at /api-docs
  // -----------------------------

  await app.listen(3000);
}
bootstrap();
