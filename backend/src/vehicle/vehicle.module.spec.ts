import { Test, TestingModule } from '@nestjs/testing';
import { VehicleModule } from './vehicle.module';
import { VehicleController } from './vehicle.controller';
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

describe('VehicleModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [VehicleModule],
    }).compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should register VehicleController', () => {
    expect(module.get(VehicleController)).toBeDefined();
  });

  it('should register VehicleService', () => {
    expect(module.get(VehicleService)).toBeDefined();
  });

  it('should register VehicleSharingService', () => {
    expect(module.get(VehicleSharingService)).toBeDefined();
  });
});
