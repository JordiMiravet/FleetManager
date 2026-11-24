import { RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { buildCreateEventDto } from '../common/testing/builders';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

jest.mock('../auth/firebase-auth.guard', () => ({
  FirebaseAuthGuard: class FirebaseAuthGuard {},
}));

const ROUTES: [keyof EventsController, RequestMethod, string][] = [
  ['findAll', RequestMethod.GET, '/'],
  ['findOne', RequestMethod.GET, ':id'],
  ['create', RequestMethod.POST, '/'],
  ['update', RequestMethod.PUT, ':id'],
  ['delete', RequestMethod.DELETE, ':id'],
];

describe('EventsController', () => {
  const failure = new Error('Service failure');

  const eventsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let controller: EventsController;

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: eventsService }],
    }).compile();

    controller = moduleRef.get(EventsController);
  });

  describe('routing', () => {
    it('is mounted under the events path', () => {
      expect(Reflect.getMetadata(PATH_METADATA, EventsController)).toBe(
        'events',
      );
    });

    it('is protected with FirebaseAuthGuard', () => {
      expect(Reflect.getMetadata(GUARDS_METADATA, EventsController)).toEqual([
        FirebaseAuthGuard,
      ]);
    });

    it.each(ROUTES)(
      'exposes %s with the method %s on the path "%s"',
      (name, method, path) => {
        const handler = EventsController.prototype[name] as object;

        expect(Reflect.getMetadata(METHOD_METADATA, handler)).toBe(method);
        expect(Reflect.getMetadata(PATH_METADATA, handler)).toBe(path);
      },
    );
  });

  describe('findAll', () => {
    it('returns the events of the user', async () => {
      const events = [{ id: 'event-1' }];
      eventsService.findAll.mockResolvedValue(events);

      await expect(controller.findAll('user-1')).resolves.toBe(events);
      expect(eventsService.findAll).toHaveBeenCalledWith('user-1');
    });

    it('propagates the error of the service', async () => {
      eventsService.findAll.mockRejectedValue(failure);

      await expect(controller.findAll('user-1')).rejects.toBe(failure);
    });
  });

  describe('findOne', () => {
    it('returns an event of the user', async () => {
      const event = { id: 'event-1' };
      eventsService.findOne.mockResolvedValue(event);

      await expect(controller.findOne('event-1', 'user-1')).resolves.toBe(
        event,
      );
      expect(eventsService.findOne).toHaveBeenCalledWith('event-1', 'user-1');
    });

    it('propagates the error of the service', async () => {
      eventsService.findOne.mockRejectedValue(failure);

      await expect(controller.findOne('event-1', 'user-1')).rejects.toBe(
        failure,
      );
    });
  });

  describe('create', () => {
    const dto = buildCreateEventDto();

    it('creates an event for the user', async () => {
      const event = { id: 'event-1' };
      eventsService.create.mockResolvedValue(event);

      await expect(controller.create(dto, 'user-1')).resolves.toBe(event);
      expect(eventsService.create).toHaveBeenCalledWith(dto, 'user-1');
    });

    it('propagates the error of the service', async () => {
      eventsService.create.mockRejectedValue(failure);

      await expect(controller.create(dto, 'user-1')).rejects.toBe(failure);
    });
  });

  describe('update', () => {
    const dto = { title: 'New title' };

    it('updates an event of the user', async () => {
      const event = { id: 'event-1' };
      eventsService.update.mockResolvedValue(event);

      await expect(controller.update('event-1', dto, 'user-1')).resolves.toBe(
        event,
      );
      expect(eventsService.update).toHaveBeenCalledWith(
        'event-1',
        dto,
        'user-1',
      );
    });

    it('propagates the error of the service', async () => {
      eventsService.update.mockRejectedValue(failure);

      await expect(controller.update('event-1', dto, 'user-1')).rejects.toBe(
        failure,
      );
    });
  });

  describe('delete', () => {
    it('deletes an event of the user and confirms it', async () => {
      eventsService.delete.mockResolvedValue(undefined);

      await expect(controller.delete('event-1', 'user-1')).resolves.toEqual({
        message: 'Event deleted successfully',
      });
      expect(eventsService.delete).toHaveBeenCalledWith('event-1', 'user-1');
    });

    it('propagates the error of the service', async () => {
      eventsService.delete.mockRejectedValue(failure);

      await expect(controller.delete('event-1', 'user-1')).rejects.toBe(
        failure,
      );
    });
  });
});
