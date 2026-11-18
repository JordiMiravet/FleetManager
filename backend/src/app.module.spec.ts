import 'reflect-metadata';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from './app.module';
import { FirebaseModule } from './auth/firebase/firebase.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehicleModule } from './vehicle/vehicle.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { validateEnvironment } from './config/validate-environment';
import type { EnvironmentVariables } from './config/environment-variables';

interface MongooseAsyncOptions {
  inject: unknown[];
  useFactory: (configService: ConfigService<EnvironmentVariables, true>) => {
    uri: string | undefined;
  };
}

jest.mock('@nestjs/config', () => ({
  ConfigModule: {
    forRoot: jest.fn(() => class MockConfigModule {}),
  },
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

jest.mock('./config/validate-environment', () => ({
  validateEnvironment: jest.fn(),
}));

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should register all application imports', () => {
    const imports = Reflect.getMetadata('imports', AppModule) as unknown[];

    expect(imports).toHaveLength(6);
    expect(imports).toContain(FirebaseModule);
    expect(imports).toContain(AuthModule);
    expect(imports).toContain(VehicleModule);
    expect(imports).toContain(EventsModule);
  });

  it('should configure ConfigModule globally with environment validation', () => {
    const configMock = Reflect.get(
      ConfigModule,
      'forRoot',
    ) as unknown as jest.Mock<
      unknown,
      [
        {
          isGlobal: boolean;
          validate: typeof validateEnvironment;
        },
      ]
    >;

    const config = configMock.mock.calls[0]?.[0];

    expect(config).toEqual({
      isGlobal: true,
      validate: validateEnvironment,
    });
  });

  it('should register MongooseModule with ConfigService injection', () => {
    const mongooseMock = Reflect.get(
      MongooseModule,
      'forRootAsync',
    ) as unknown as jest.Mock<unknown, [MongooseAsyncOptions]>;

    const options = mongooseMock.mock.calls[0]?.[0];

    expect(options).toBeDefined();
    expect(options?.inject).toEqual([ConfigService]);
    expect(options?.useFactory).toEqual(expect.any(Function));
  });

  it('should register AppController', () => {
    const controllers = Reflect.getMetadata(
      'controllers',
      AppModule,
    ) as unknown[];

    expect(controllers).toEqual([AppController]);
  });

  it('should register AppService', () => {
    const providers = Reflect.getMetadata('providers', AppModule) as unknown[];

    expect(providers).toContain(AppService);
  });

  it('should return MongoDB URI from ConfigService', () => {
    const mongooseMock = Reflect.get(
      MongooseModule,
      'forRootAsync',
    ) as unknown as jest.Mock<unknown, [MongooseAsyncOptions]>;

    const options = mongooseMock.mock.calls[0]?.[0];

    if (!options) {
      throw new Error('Mongoose options were not configured');
    }

    const get = jest.fn((key: string, config: { infer: true }): string => {
      expect(key).toBe('MONGO_URI');
      expect(config).toEqual({ infer: true });

      return 'mongodb://localhost:27017/test';
    });

    const result = options.useFactory({
      get,
    } as unknown as ConfigService<EnvironmentVariables, true>);

    expect(get).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      uri: 'mongodb://localhost:27017/test',
    });
  });
});
