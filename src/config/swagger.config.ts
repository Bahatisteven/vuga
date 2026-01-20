import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Vuga Platform API')
  .setVersion('1.0.0')
  .addBearerAuth()
  .addTag('auth', 'Authentication endpoints')
  .addTag('users', 'User management endpoints')
  .addTag('calls', 'Call management endpoints')
  .addTag('translation', 'Translation endpoints')
  .addTag('speech', 'Speech endpoints')
  .build();
