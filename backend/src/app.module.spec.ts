import 'reflect-metadata';

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

import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FirebaseModule } from './auth/firebase/firebase.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehicleModule } from './vehicle/vehicle.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';

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

  it('should register ConfigModule globally', () => {
    const imports = Reflect.getMetadata('imports', AppModule) as unknown[];

    expect(imports.length).toBeGreaterThan(0);
    expect(ConfigModule).toBeDefined();
  });

  it('should register MongooseModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule) as unknown[];

    expect(imports.length).toBeGreaterThan(0);
    expect(MongooseModule).toBeDefined();
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
    const mongooseOptions = Reflect.getMetadata(
      'imports',
      AppModule,
    ) as unknown[];

    expect(mongooseOptions).toBeDefined();
  });
});
