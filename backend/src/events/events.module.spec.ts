import 'reflect-metadata';

import { MongooseModule } from '@nestjs/mongoose';

jest.mock('./events.controller', () => ({
  EventsController: jest.fn(),
}));

jest.mock('./events.service', () => ({
  EventsService: jest.fn(),
}));

jest.mock('../vehicle/access/vehicle-access.module', () => ({
  VehicleAccessModule: jest.fn(),
}));

jest.mock('./schemas/event.schema', () => ({
  Event: class Event {},
  EventSchema: {},
}));

jest.mock('@nestjs/mongoose', () => ({
  MongooseModule: {
    forFeature: jest.fn().mockReturnValue(class MockMongooseModule {}),
  },
}));

import { EventsModule } from './events.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { VehicleAccessModule } from '../vehicle/access/vehicle-access.module';

describe('EventsModule', () => {
  it('should be defined', () => {
    expect(EventsModule).toBeDefined();
  });

  it('should register the correct controller', () => {
    expect(Reflect.getMetadata('controllers', EventsModule)).toEqual([
      EventsController,
    ]);
  });

  it('should register EventsService as provider', () => {
    expect(Reflect.getMetadata('providers', EventsModule)).toContain(
      EventsService,
    );
  });

  it('should export EventsService', () => {
    expect(Reflect.getMetadata('exports', EventsModule)).toContain(
      EventsService,
    );
  });

  it('should import VehicleAccessModule', () => {
    const imports = Reflect.getMetadata('imports', EventsModule) as unknown[];

    expect(imports).toContain(VehicleAccessModule);
  });

  it('should register the Event schema with Mongoose', () => {
    expect(jest.mocked(MongooseModule).forFeature).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Event',
          schema: {},
        }),
      ]),
    );
  });
});
