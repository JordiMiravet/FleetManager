import { Type } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { EventsModule } from '../events/events.module';
import { VehicleAccessModule } from './access/vehicle-access.module';
import { VehicleSchema } from './schemas/vehicle.schema';
import { VehicleController } from './vehicle.controller';
import { VehicleModule } from './vehicle.module';
import { VehicleService } from './vehicle.service';
import { VehicleSharingService } from './vehicle-sharing.service';

jest.mock('./vehicle.controller', () => ({
  VehicleController: class VehicleController {},
}));

jest.mock('./vehicle.service', () => ({
  VehicleService: class VehicleService {},
}));

jest.mock('./vehicle-sharing.service', () => ({
  VehicleSharingService: class VehicleSharingService {},
}));

jest.mock('./schemas/vehicle.schema', () => ({
  Vehicle: { name: 'Vehicle' },
  VehicleSchema: {},
}));

jest.mock('./access/vehicle-access.module', () => ({
  VehicleAccessModule: class VehicleAccessModule {},
}));

jest.mock('../events/events.module', () => ({
  EventsModule: class EventsModule {},
}));

jest.mock('@nestjs/mongoose', () => ({
  MongooseModule: {
    forFeature: jest
      .fn()
      .mockReturnValue({ module: class MockMongooseModule {} }),
  },
}));

const metadata = (key: string): unknown =>
  Reflect.getMetadata(key, VehicleModule);

describe('VehicleModule', () => {
  describe('metadata', () => {
    it.each<[string, Type<unknown>]>([
      ['VehicleAccessModule', VehicleAccessModule],
      ['EventsModule', EventsModule],
    ])('imports %s', (_name, imported) => {
      expect(metadata('imports')).toContain(imported);
    });

    it('registers the Vehicle schema with Mongoose', () => {
      expect(jest.mocked(MongooseModule.forFeature)).toHaveBeenCalledWith([
        { name: 'Vehicle', schema: VehicleSchema },
      ]);
    });

    it('registers VehicleController as its only controller', () => {
      expect(metadata('controllers')).toEqual([VehicleController]);
    });

    it('provides VehicleService and VehicleSharingService', () => {
      expect(metadata('providers')).toEqual([
        VehicleService,
        VehicleSharingService,
      ]);
    });

    it('does not export any provider', () => {
      expect(metadata('exports')).toBeUndefined();
    });
  });

  describe('dependency injection', () => {
    let moduleRef: TestingModule;

    beforeAll(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [VehicleModule],
      }).compile();
    });

    afterAll(async () => {
      await moduleRef.close();
    });

    it.each<[string, Type<unknown>]>([
      ['VehicleController', VehicleController],
      ['VehicleService', VehicleService],
      ['VehicleSharingService', VehicleSharingService],
    ])('resolves %s', (_name, token) => {
      expect(moduleRef.get(token)).toBeDefined();
    });
  });
});
