import 'reflect-metadata';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FirebaseModule } from './auth/firebase/firebase.module';
import { AllExceptionsFilter } from './common/errors/all-exceptions.filter';
import type { EnvironmentVariables } from './config/environment-variables';
import { validateEnvironment } from './config/validate-environment';
import { EventsModule } from './events/events.module';
import { VehicleModule } from './vehicle/vehicle.module';

interface MongooseAsyncOptions {
  inject: unknown[];
  useFactory: (configService: ConfigService<EnvironmentVariables, true>) => {
    uri: string;
  };
}

jest.mock('@nestjs/config', () => ({
  ConfigModule: { forRoot: jest.fn(() => class MockConfigModule {}) },
  ConfigService: jest.fn(),
}));

jest.mock('@nestjs/mongoose', () => ({
  MongooseModule: {
    forRootAsync: jest.fn(() => class MockMongooseModule {}),
  },
}));

jest.mock('./auth/firebase/firebase.module', () => ({
  FirebaseModule: class FirebaseModule {},
}));

jest.mock('./app.controller', () => ({
  AppController: class AppController {},
}));

jest.mock('./app.service', () => ({
  AppService: class AppService {},
}));

jest.mock('./vehicle/vehicle.module', () => ({
  VehicleModule: class VehicleModule {},
}));

jest.mock('./auth/auth.module', () => ({
  AuthModule: class AuthModule {},
}));

jest.mock('./events/events.module', () => ({
  EventsModule: class EventsModule {},
}));

jest.mock('./common/errors/all-exceptions.filter', () => ({
  AllExceptionsFilter: class AllExceptionsFilter {},
}));

jest.mock('./config/validate-environment', () => ({
  validateEnvironment: jest.fn(),
}));

const [mongooseOptions] = jest.mocked(MongooseModule).forRootAsync.mock
  .calls[0] as unknown as [MongooseAsyncOptions];

describe('AppModule', () => {
  describe('imports', () => {
    it('imports the feature modules', () => {
      const imports = Reflect.getMetadata('imports', AppModule) as unknown[];

      expect(imports).toHaveLength(6);
      expect(imports).toEqual(
        expect.arrayContaining([
          FirebaseModule,
          AuthModule,
          VehicleModule,
          EventsModule,
        ]),
      );
    });

    it('configures ConfigModule globally with the environment validation', () => {
      expect(jest.mocked(ConfigModule).forRoot).toHaveBeenCalledWith({
        isGlobal: true,
        validate: validateEnvironment,
      });
    });

    it('configures MongooseModule asynchronously with ConfigService', () => {
      expect(mongooseOptions.inject).toEqual([ConfigService]);
      expect(mongooseOptions.useFactory).toEqual(expect.any(Function));
    });
  });

  describe('Mongoose factory', () => {
    it('returns the MongoDB URI read from the configuration', () => {
      const get = jest.fn().mockReturnValue('mongodb://localhost:27017/test');

      const options = mongooseOptions.useFactory({
        get,
      } as unknown as ConfigService<EnvironmentVariables, true>);

      expect(get).toHaveBeenCalledWith('MONGO_URI', { infer: true });
      expect(options).toEqual({ uri: 'mongodb://localhost:27017/test' });
    });
  });

  describe('controllers', () => {
    it('registers AppController as its only controller', () => {
      expect(Reflect.getMetadata('controllers', AppModule)).toEqual([
        AppController,
      ]);
    });
  });

  describe('providers', () => {
    it('provides AppService', () => {
      expect(Reflect.getMetadata('providers', AppModule)).toContain(AppService);
    });

    it('registers AllExceptionsFilter as the global exception filter', () => {
      expect(Reflect.getMetadata('providers', AppModule)).toContainEqual({
        provide: APP_FILTER,
        useClass: AllExceptionsFilter,
      });
    });
  });
});
