import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Event } from './schemas/event.schema';
import { VehicleAccessService } from '../vehicle/access/vehicle-access.service';
import { EventsService } from './events.service';

interface EventModelMock extends jest.Mock {
  exists: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  deleteOne: jest.Mock;
  deleteMany: jest.Mock;
}

function resolvingQuery<T>(value: T) {
  return { exec: jest.fn().mockResolvedValue(value) };
}

async function expectRejection(
  promise: Promise<unknown>,
  type: new (message?: string) => Error,
  message: string,
) {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  );

  expect(error).toBeInstanceOf(type);
  expect((error as Error).message).toBe(message);
}

describe('EventsService', () => {
  const ownerVehicle = { _id: 'vehicle-1', userId: 'owner-1' };
  const createDto = {
    title: 'Trip',
    date: '2026-11-10',
    hourStart: '09:00',
    hourEnd: '10:00',
    vehicleId: 'vehicle-1',
  };

  let save: jest.Mock;
  let eventModel: EventModelMock;
  let findAccessibleVehicle: jest.Mock;
  let service: EventsService;

  beforeEach(() => {
    save = jest.fn();
    eventModel = Object.assign(
      jest.fn().mockImplementation((data: object) => ({ ...data, save })),
      {
        exists: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        deleteOne: jest.fn(),
        deleteMany: jest.fn(),
      },
    );
    findAccessibleVehicle = jest.fn();

    service = new EventsService(
      eventModel as unknown as Model<Event>,
      {
        findAccessibleVehicle,
        isOwner: (vehicle: { userId: string }, userId: string) =>
          vehicle.userId === userId,
      } as unknown as VehicleAccessService,
    );
  });

  describe('deleteByVehicle', () => {
    it('deletes every event of the vehicle whoever created it', async () => {
      eventModel.deleteMany.mockReturnValue(
        resolvingQuery({ deletedCount: 2 }),
      );

      await service.deleteByVehicle('vehicle-1');

      expect(eventModel.deleteMany).toHaveBeenCalledWith({
        vehicleId: 'vehicle-1',
      });
    });
  });

  describe('create', () => {
    beforeEach(() => {
      findAccessibleVehicle.mockResolvedValue(ownerVehicle);
      eventModel.exists.mockReturnValue(resolvingQuery(null));
      save.mockResolvedValue({ _id: 'event-1' });
    });

    it('creates the event with the user as creator after checking the access and the overlaps', async () => {
      await expect(service.create(createDto, 'user-2')).resolves.toEqual({
        _id: 'event-1',
      });

      expect(findAccessibleVehicle).toHaveBeenCalledWith('vehicle-1', 'user-2');
      expect(eventModel.exists).toHaveBeenCalledWith({
        vehicleId: 'vehicle-1',
        date: '2026-11-10',
        hourStart: { $lt: '10:00' },
        hourEnd: { $gt: '09:00' },
      });
      expect(eventModel).toHaveBeenCalledWith({
        ...createDto,
        userId: 'user-2',
      });
    });

    it('rejects a vehicle the user cannot access', async () => {
      findAccessibleVehicle.mockResolvedValue(null);

      await expectRejection(
        service.create(createDto, 'stranger'),
        NotFoundException,
        'Vehicle not found',
      );
      expect(eventModel.exists).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
    });

    it.each(['08:30', '09:00'])(
      'rejects the end time %s when the start time is 09:00',
      async (hourEnd) => {
        await expectRejection(
          service.create({ ...createDto, hourEnd }, 'user-2'),
          BadRequestException,
          'The end time must be after the start time',
        );
        expect(save).not.toHaveBeenCalled();
      },
    );

    it('rejects an invalid time format', async () => {
      await expectRejection(
        service.create({ ...createDto, hourStart: '9:00' }, 'user-2'),
        BadRequestException,
        'Invalid time "9:00". Expected HH:mm',
      );
      expect(save).not.toHaveBeenCalled();
    });

    it('rejects an event that overlaps another event of the vehicle', async () => {
      eventModel.exists.mockReturnValue(resolvingQuery({ _id: 'other-event' }));

      await expectRejection(
        service.create(createDto, 'user-2'),
        ConflictException,
        'The vehicle already has an event in that time range',
      );
      expect(save).not.toHaveBeenCalled();
    });
  });
});
