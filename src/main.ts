import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * entry point
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/v1/api');

  const port = process.env.PORT!;
  await app.listen(port);

  console.log(`Vuga Platform API running on http://localhost:${port}`);
}

bootstrap();
