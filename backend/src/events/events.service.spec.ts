import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
  const storedEvent = {
    _id: 'event-1',
    userId: 'user-2',
    vehicleId: 'vehicle-1',
    title: 'Trip',
    date: '2026-11-10',
    hourStart: '09:00',
    hourEnd: '10:00',
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

  describe('update', () => {
    const updatedEvent = { _id: 'event-1', updated: true };

    beforeEach(() => {
      findAccessibleVehicle.mockResolvedValue(ownerVehicle);
      eventModel.findById.mockReturnValue(resolvingQuery(storedEvent));
      eventModel.findByIdAndUpdate.mockReturnValue(
        resolvingQuery(updatedEvent),
      );
      eventModel.exists.mockReturnValue(resolvingQuery(null));
    });

    it('lets the creator update the event', async () => {
      await expect(
        service.update('event-1', { title: 'New' }, 'user-2'),
      ).resolves.toBe(updatedEvent);

      expect(findAccessibleVehicle).toHaveBeenCalledWith('vehicle-1', 'user-2');
      expect(eventModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'event-1',
        { title: 'New' },
        { new: true },
      );
    });

    it('lets the owner of the vehicle update an event created by someone else', async () => {
      await expect(
        service.update('event-1', { title: 'New' }, 'owner-1'),
      ).resolves.toBe(updatedEvent);
    });

    it('rejects a user with access who is neither the creator nor the owner', async () => {
      await expectRejection(
        service.update('event-1', { title: 'New' }, 'user-3'),
        ForbiddenException,
        'Only the creator of the event or the owner of the vehicle can modify it',
      );
      expect(eventModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('reports an event that does not exist as not found', async () => {
      eventModel.findById.mockReturnValue(resolvingQuery(null));

      await expectRejection(
        service.update('event-1', { title: 'New' }, 'user-2'),
        NotFoundException,
        'Event with ID event-1 not found',
      );
    });

    it('reports an event of an inaccessible vehicle as not found', async () => {
      findAccessibleVehicle.mockResolvedValue(null);

      await expectRejection(
        service.update('event-1', { title: 'New' }, 'stranger'),
        NotFoundException,
        'Event with ID event-1 not found',
      );
      expect(eventModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('rejects moving the event to a vehicle the user cannot access', async () => {
      findAccessibleVehicle.mockImplementation((vehicleId: string) =>
        Promise.resolve(vehicleId === 'vehicle-2' ? null : ownerVehicle),
      );

      await expectRejection(
        service.update('event-1', { vehicleId: 'vehicle-2' }, 'user-2'),
        NotFoundException,
        'Vehicle not found',
      );
      expect(eventModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('checks the overlaps in the new vehicle when moving the event', async () => {
      await service.update('event-1', { vehicleId: 'vehicle-2' }, 'user-2');

      expect(eventModel.exists).toHaveBeenCalledWith({
        vehicleId: 'vehicle-2',
        date: '2026-11-10',
        hourStart: { $lt: '10:00' },
        hourEnd: { $gt: '09:00' },
        _id: { $ne: 'event-1' },
      });
    });

    it('validates the new end time against the stored start time', async () => {
      await expectRejection(
        service.update('event-1', { hourEnd: '08:00' }, 'user-2'),
        BadRequestException,
        'The end time must be after the start time',
      );
      expect(eventModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('ignores the event itself when looking for overlaps', async () => {
      await service.update('event-1', { hourEnd: '11:00' }, 'user-2');

      expect(eventModel.exists).toHaveBeenCalledWith({
        vehicleId: 'vehicle-1',
        date: '2026-11-10',
        hourStart: { $lt: '11:00' },
        hourEnd: { $gt: '09:00' },
        _id: { $ne: 'event-1' },
      });
    });

    it('rejects a change that overlaps another event', async () => {
      eventModel.exists.mockReturnValue(resolvingQuery({ _id: 'other-event' }));

      await expectRejection(
        service.update('event-1', { hourEnd: '11:00' }, 'user-2'),
        ConflictException,
        'The vehicle already has an event in that time range',
      );
      expect(eventModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('does not validate the scheduling when only the title changes', async () => {
      await service.update('event-1', { title: 'New' }, 'user-2');

      expect(eventModel.exists).not.toHaveBeenCalled();
    });

    it('does not validate the scheduling when the stored values are resent', async () => {
      await service.update(
        'event-1',
        {
          title: 'Trip',
          date: '2026-11-10',
          hourStart: '09:00',
          hourEnd: '10:00',
          vehicleId: 'vehicle-1',
        },
        'user-2',
      );

      expect(eventModel.exists).not.toHaveBeenCalled();
      expect(findAccessibleVehicle).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      findAccessibleVehicle.mockResolvedValue(ownerVehicle);
      eventModel.findById.mockReturnValue(resolvingQuery(storedEvent));
      eventModel.deleteOne.mockReturnValue(resolvingQuery({ deletedCount: 1 }));
    });

    it('lets the creator delete the event', async () => {
      await expect(
        service.delete('event-1', 'user-2'),
      ).resolves.toBeUndefined();

      expect(eventModel.deleteOne).toHaveBeenCalledWith({ _id: 'event-1' });
    });

    it('lets the owner of the vehicle delete an event created by someone else', async () => {
      await expect(
        service.delete('event-1', 'owner-1'),
      ).resolves.toBeUndefined();
    });

    it('rejects a user with access who is neither the creator nor the owner', async () => {
      await expectRejection(
        service.delete('event-1', 'user-3'),
        ForbiddenException,
        'Only the creator of the event or the owner of the vehicle can modify it',
      );
      expect(eventModel.deleteOne).not.toHaveBeenCalled();
    });

    it('reports an event that does not exist as not found', async () => {
      eventModel.findById.mockReturnValue(resolvingQuery(null));

      await expectRejection(
        service.delete('event-1', 'user-2'),
        NotFoundException,
        'Event with ID event-1 not found',
      );
    });

    it('reports an event of an inaccessible vehicle as not found', async () => {
      findAccessibleVehicle.mockResolvedValue(null);

      await expectRejection(
        service.delete('event-1', 'stranger'),
        NotFoundException,
        'Event with ID event-1 not found',
      );
      expect(eventModel.deleteOne).not.toHaveBeenCalled();
    });

    it('reports as not found an event that was already deleted', async () => {
      eventModel.deleteOne.mockReturnValue(resolvingQuery({ deletedCount: 0 }));

      await expectRejection(
        service.delete('event-1', 'user-2'),
        NotFoundException,
        'Event with ID event-1 not found',
      );
    });
  });
});
