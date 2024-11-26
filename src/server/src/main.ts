import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Active la validation pour toutes les routes
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
