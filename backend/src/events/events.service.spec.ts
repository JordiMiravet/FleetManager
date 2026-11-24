import { HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  buildCreateEventDto,
  buildEvent,
  buildVehicle,
} from '../common/testing/builders';
import { expectHttpError } from '../common/testing/expect-http-error';
import { resolvingQuery } from '../common/testing/mongoose-mocks';
import { VehicleAccessService } from '../vehicle/access/vehicle-access.service';
import { UpdateEventDto } from './dtos/update-event.dto';
import { EventsService } from './events.service';
import { Event } from './schemas/event.schema';

interface EventModelMock extends jest.Mock {
  find: jest.Mock;
  findOne: jest.Mock;
  exists: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  deleteOne: jest.Mock;
  deleteMany: jest.Mock;
}

const OVERLAP_MESSAGE = 'The vehicle already has an event in that time range';
const TIME_RANGE_MESSAGE = 'The end time must be after the start time';

const eventNotFound = (id: string) => `Event with ID ${id} not found`;

const createEventModelMock = (save: jest.Mock): EventModelMock =>
  Object.assign(
    jest.fn().mockImplementation((data: object) => ({ ...data, save })),
    {
      find: jest.fn(),
      findOne: jest.fn(),
      exists: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
    },
  );

describe('EventsService', () => {
  const vehicle = buildVehicle();
  const storedEvent = buildEvent();
  const createDto = buildCreateEventDto();

  let save: jest.Mock;
  let eventModel: EventModelMock;
  let findAccessibleVehicle: jest.Mock;
  let findAccessibleVehicleIds: jest.Mock;
  let service: EventsService;

  beforeEach(() => {
    save = jest.fn();
    eventModel = createEventModelMock(save);
    findAccessibleVehicle = jest.fn();
    findAccessibleVehicleIds = jest.fn();

    service = new EventsService(
      eventModel as unknown as Model<Event>,
      {
        findAccessibleVehicle,
        findAccessibleVehicleIds,
      } as unknown as VehicleAccessService,
    );
  });

  describe('findAll', () => {
    it('returns the events of the vehicles accessible by the user', async () => {
      findAccessibleVehicleIds.mockResolvedValue(['vehicle-1']);
      eventModel.find.mockReturnValue(resolvingQuery([storedEvent]));

      await expect(service.findAll('user-2')).resolves.toEqual([storedEvent]);

      expect(findAccessibleVehicleIds).toHaveBeenCalledWith('user-2');
      expect(eventModel.find).toHaveBeenCalledWith({
        vehicleId: { $in: ['vehicle-1'] },
      });
    });

    it('returns an empty list when the user has no accessible vehicles', async () => {
      findAccessibleVehicleIds.mockResolvedValue([]);
      eventModel.find.mockReturnValue(resolvingQuery([]));

      await expect(service.findAll('stranger')).resolves.toEqual([]);

      expect(eventModel.find).toHaveBeenCalledWith({ vehicleId: { $in: [] } });
    });
  });

  describe('findOne', () => {
    it('returns an event of an accessible vehicle', async () => {
      findAccessibleVehicleIds.mockResolvedValue(['vehicle-1']);
      eventModel.findOne.mockReturnValue(resolvingQuery(storedEvent));

      await expect(service.findOne('event-1', 'user-2')).resolves.toEqual(
        storedEvent,
      );

      expect(findAccessibleVehicleIds).toHaveBeenCalledWith('user-2');
      expect(eventModel.findOne).toHaveBeenCalledWith({
        _id: 'event-1',
        vehicleId: { $in: ['vehicle-1'] },
      });
    });

    it.each<[string, string, string, string[]]>([
      [
        'an event of an inaccessible vehicle',
        'event-1',
        'stranger',
        ['vehicle-2'],
      ],
      [
        'an event that does not exist',
        'unknown-event',
        'user-2',
        ['vehicle-1'],
      ],
    ])('rejects %s', async (_label, id, userId, vehicleIds) => {
      findAccessibleVehicleIds.mockResolvedValue(vehicleIds);
      eventModel.findOne.mockReturnValue(resolvingQuery(null));

      await expectHttpError(
        service.findOne(id, userId),
        HttpStatus.NOT_FOUND,
        eventNotFound(id),
      );
    });
  });

  describe('create', () => {
    beforeEach(() => {
      findAccessibleVehicle.mockResolvedValue(vehicle);
      eventModel.exists.mockReturnValue(resolvingQuery(null));
      save.mockResolvedValue({ _id: 'event-1' });
    });

    it('creates the event with the user as creator after checking access and overlaps', async () => {
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

    describe('access to the vehicle', () => {
      it('rejects a vehicle the user cannot access', async () => {
        findAccessibleVehicle.mockResolvedValue(null);

        await expectHttpError(
          service.create(createDto, 'stranger'),
          HttpStatus.NOT_FOUND,
          'Vehicle not found',
        );
        expect(eventModel.exists).not.toHaveBeenCalled();
        expect(save).not.toHaveBeenCalled();
      });
    });

    describe('time range', () => {
      it.each(['08:30', '09:00'])(
        'rejects the end time %s when the start time is 09:00',
        async (hourEnd) => {
          await expectHttpError(
            service.create({ ...createDto, hourEnd }, 'user-2'),
            HttpStatus.BAD_REQUEST,
            TIME_RANGE_MESSAGE,
          );
          expect(save).not.toHaveBeenCalled();
        },
      );

      it('rejects an invalid time format', async () => {
        await expectHttpError(
          service.create({ ...createDto, hourStart: '9:00' }, 'user-2'),
          HttpStatus.BAD_REQUEST,
          'Invalid time "9:00". Expected HH:mm',
        );
        expect(save).not.toHaveBeenCalled();
      });
    });

    describe('overlaps', () => {
      it('rejects an event that overlaps another event of the vehicle', async () => {
        eventModel.exists.mockReturnValue(
          resolvingQuery({ _id: 'other-event' }),
        );

        await expectHttpError(
          service.create(createDto, 'user-2'),
          HttpStatus.CONFLICT,
          OVERLAP_MESSAGE,
        );
        expect(save).not.toHaveBeenCalled();
      });
    });
  });

  describe('update', () => {
    const updatedEvent = { _id: 'event-1', updated: true };

    const update = (changes: UpdateEventDto, userId = 'user-2') =>
      service.update('event-1', changes, userId);

    beforeEach(() => {
      findAccessibleVehicle.mockResolvedValue(vehicle);
      eventModel.findById.mockReturnValue(resolvingQuery(storedEvent));
      eventModel.findByIdAndUpdate.mockReturnValue(
        resolvingQuery(updatedEvent),
      );
      eventModel.exists.mockReturnValue(resolvingQuery(null));
    });

    describe('permissions', () => {
      it.each([
        ['the creator', 'user-2'],
        ['another user with access to the vehicle', 'user-3'],
      ])('lets %s update the event', async (_label, userId) => {
        await expect(update({ title: 'New' }, userId)).resolves.toBe(
          updatedEvent,
        );

        expect(findAccessibleVehicle).toHaveBeenCalledWith('vehicle-1', userId);
        expect(eventModel.findByIdAndUpdate).toHaveBeenCalledWith(
          'event-1',
          { title: 'New' },
          { new: true },
        );
      });

      it('reports an event that does not exist as not found', async () => {
        eventModel.findById.mockReturnValue(resolvingQuery(null));

        await expectHttpError(
          update({ title: 'New' }),
          HttpStatus.NOT_FOUND,
          eventNotFound('event-1'),
        );
      });

      it('reports an event of an inaccessible vehicle as not found', async () => {
        findAccessibleVehicle.mockResolvedValue(null);

        await expectHttpError(
          update({ title: 'New' }, 'stranger'),
          HttpStatus.NOT_FOUND,
          eventNotFound('event-1'),
        );
        expect(eventModel.findByIdAndUpdate).not.toHaveBeenCalled();
      });
    });

    describe('moving to another vehicle', () => {
      it('rejects a vehicle the user cannot access', async () => {
        findAccessibleVehicle.mockImplementation((vehicleId: string) =>
          Promise.resolve(vehicleId === 'vehicle-2' ? null : vehicle),
        );

        await expectHttpError(
          update({ vehicleId: 'vehicle-2' }),
          HttpStatus.NOT_FOUND,
          'Vehicle not found',
        );
        expect(eventModel.findByIdAndUpdate).not.toHaveBeenCalled();
      });

      it('checks the overlaps in the new vehicle', async () => {
        await update({ vehicleId: 'vehicle-2' });

        expect(eventModel.exists).toHaveBeenCalledWith({
          vehicleId: 'vehicle-2',
          date: '2026-11-10',
          hourStart: { $lt: '10:00' },
          hourEnd: { $gt: '09:00' },
          _id: { $ne: 'event-1' },
        });
      });
    });

    describe('scheduling', () => {
      it('validates the new end time against the stored start time', async () => {
        await expectHttpError(
          update({ hourEnd: '08:00' }),
          HttpStatus.BAD_REQUEST,
          TIME_RANGE_MESSAGE,
        );
        expect(eventModel.findByIdAndUpdate).not.toHaveBeenCalled();
      });

      it('ignores the event itself when looking for overlaps', async () => {
        await update({ hourEnd: '11:00' });

        expect(eventModel.exists).toHaveBeenCalledWith({
          vehicleId: 'vehicle-1',
          date: '2026-11-10',
          hourStart: { $lt: '11:00' },
          hourEnd: { $gt: '09:00' },
          _id: { $ne: 'event-1' },
        });
      });

      it('rejects a change that overlaps another event', async () => {
        eventModel.exists.mockReturnValue(
          resolvingQuery({ _id: 'other-event' }),
        );

        await expectHttpError(
          update({ hourEnd: '11:00' }),
          HttpStatus.CONFLICT,
          OVERLAP_MESSAGE,
        );
        expect(eventModel.findByIdAndUpdate).not.toHaveBeenCalled();
      });

      it('does not validate the scheduling when only the title changes', async () => {
        await update({ title: 'New' });

        expect(eventModel.exists).not.toHaveBeenCalled();
      });

      it('does not validate the scheduling when the stored values are resent', async () => {
        await update(createDto);

        expect(eventModel.exists).not.toHaveBeenCalled();
        expect(findAccessibleVehicle).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the event cannot be updated', () => {
      it('reports an event that could not be updated as not found', async () => {
        eventModel.findByIdAndUpdate.mockReturnValue(resolvingQuery(null));

        await expectHttpError(
          update({ title: 'New' }),
          HttpStatus.NOT_FOUND,
          eventNotFound('event-1'),
        );
      });
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      findAccessibleVehicle.mockResolvedValue(vehicle);
      eventModel.findById.mockReturnValue(resolvingQuery(storedEvent));
      eventModel.deleteOne.mockReturnValue(resolvingQuery({ deletedCount: 1 }));
    });

    describe('permissions', () => {
      it.each([
        ['the creator', 'user-2'],
        ['another user with access to the vehicle', 'user-3'],
      ])('lets %s delete the event', async (_label, userId) => {
        await expect(
          service.delete('event-1', userId),
        ).resolves.toBeUndefined();

        expect(findAccessibleVehicle).toHaveBeenCalledWith('vehicle-1', userId);
        expect(eventModel.deleteOne).toHaveBeenCalledWith({ _id: 'event-1' });
      });

      it('reports an event that does not exist as not found', async () => {
        eventModel.findById.mockReturnValue(resolvingQuery(null));

        await expectHttpError(
          service.delete('event-1', 'user-2'),
          HttpStatus.NOT_FOUND,
          eventNotFound('event-1'),
        );
      });

      it('reports an event of an inaccessible vehicle as not found', async () => {
        findAccessibleVehicle.mockResolvedValue(null);

        await expectHttpError(
          service.delete('event-1', 'stranger'),
          HttpStatus.NOT_FOUND,
          eventNotFound('event-1'),
        );
        expect(eventModel.deleteOne).not.toHaveBeenCalled();
      });
    });

    describe('when the event cannot be deleted', () => {
      it('reports an event that was already deleted as not found', async () => {
        eventModel.deleteOne.mockReturnValue(
          resolvingQuery({ deletedCount: 0 }),
        );

        await expectHttpError(
          service.delete('event-1', 'user-2'),
          HttpStatus.NOT_FOUND,
          eventNotFound('event-1'),
        );
      });
    });
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
});
