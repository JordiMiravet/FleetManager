import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { EnvironmentVariables } from './config/environment-variables';
import { validationPipeOptions } from './common/validation-pipe-options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService =
    app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

  app.enableCors({
    origin: configService.get('CORS_ORIGIN', { infer: true }),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));

  await app.listen(configService.get('PORT', { infer: true }));
}
bootstrap();
