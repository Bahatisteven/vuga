import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * entry point
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/v1/api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        excludeExtraneousValues: false,
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Vuga Platform API')
    .setVersion('1.0.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const port = process.env.PORT!;
  await app.listen(port);

  console.log(`Vuga Platform API running on http://localhost:${port}/v1/api/`);
  console.log(`API Documentation http://localhost:${port}/api/docs`);
}

bootstrap();
