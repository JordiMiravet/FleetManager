import 'reflect-metadata';

import { MongooseModule } from '@nestjs/mongoose';
import { VehicleAccessModule } from '../vehicle/access/vehicle-access.module';
import { EventsController } from './events.controller';
import { EventsModule } from './events.module';
import { EventsService } from './events.service';
import { EventSchema } from './schemas/event.schema';

jest.mock('./events.controller', () => ({
  EventsController: class EventsController {},
}));

jest.mock('./events.service', () => ({
  EventsService: class EventsService {},
}));

jest.mock('../vehicle/access/vehicle-access.module', () => ({
  VehicleAccessModule: class VehicleAccessModule {},
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

const metadata = (key: string): unknown =>
  Reflect.getMetadata(key, EventsModule);

describe('EventsModule', () => {
  it('registers EventsController as its only controller', () => {
    expect(metadata('controllers')).toEqual([EventsController]);
  });

  it('provides EventsService', () => {
    expect(metadata('providers')).toEqual([EventsService]);
  });

  it('exports EventsService', () => {
    expect(metadata('exports')).toEqual([EventsService]);
  });

  describe('imports', () => {
    it('imports VehicleAccessModule', () => {
      expect(metadata('imports')).toContain(VehicleAccessModule);
    });

    it('registers the Event schema with Mongoose', () => {
      expect(jest.mocked(MongooseModule).forFeature).toHaveBeenCalledWith([
        { name: 'Event', schema: EventSchema },
      ]);
    });
  });
});
