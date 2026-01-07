import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Vuga Platform API')
  .setDescription('Real-time Voice Translator API')
  .setVersion('1.0.0')
  .addBearerAuth()
  .addTag('auth', 'Authentication endpoints')
  .addTag('users', 'User management endpoints')
  .addTag('calls', 'Call management endpoints')
  .build();
