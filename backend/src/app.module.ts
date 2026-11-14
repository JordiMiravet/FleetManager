import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { FirebaseModule } from './auth/firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { EnvironmentVariables } from './config/environment-variables';
import { validateEnvironment } from './config/validate-environment';
import { AllExceptionsFilter } from './common/errors/all-exceptions.filter';
import { VehicleModule } from './vehicle/vehicle.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        uri: configService.get('MONGO_URI', { infer: true }),
      }),
    }),
    FirebaseModule,
    AuthModule,
    VehicleModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
