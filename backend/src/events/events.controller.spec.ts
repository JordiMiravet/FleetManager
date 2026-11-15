import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

jest.mock('../auth/firebase-auth.guard', () => ({
  FirebaseAuthGuard: class FirebaseAuthGuard {},
}));

describe('EventsController', () => {
  let controller: EventsController;

  const mockEventsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return events belonging to the user', async () => {
      const events = [{ id: 'event-1' }];
      mockEventsService.findAll.mockResolvedValue(events);

      await expect(controller.findAll('user-1')).resolves.toEqual(events);

      expect(mockEventsService.findAll).toHaveBeenCalledTimes(1);
      expect(mockEventsService.findAll).toHaveBeenCalledWith('user-1');
    });

    it('should propagate errors from the service', async () => {
      const error = new Error('Internal server error');
      mockEventsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll('user-1')).rejects.toBe(error);

      expect(mockEventsService.findAll).toHaveBeenCalledTimes(1);
      expect(mockEventsService.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findOne', () => {
    it('should return an event belonging to the user', async () => {
      const event = { id: 'event-1' };
      mockEventsService.findOne.mockResolvedValue(event);

      await expect(controller.findOne('event-1', 'user-1')).resolves.toEqual(
        event,
      );

      expect(mockEventsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockEventsService.findOne).toHaveBeenCalledWith(
        'event-1',
        'user-1',
      );
    });

    it('should propagate errors from the service', async () => {
      const error = new Error('Event not found');
      mockEventsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne('event-1', 'user-1')).rejects.toBe(error);

      expect(mockEventsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockEventsService.findOne).toHaveBeenCalledWith(
        'event-1',
        'user-1',
      );
    });
  });

  describe('create', () => {
    it('should create an event for the user', async () => {
      const dto = {} as Parameters<EventsController['create']>[0];
      const event = { id: 'event-1' };
      mockEventsService.create.mockResolvedValue(event);

      await expect(controller.create(dto, 'user-1')).resolves.toEqual(event);

      expect(mockEventsService.create).toHaveBeenCalledTimes(1);
      expect(mockEventsService.create).toHaveBeenCalledWith(dto, 'user-1');
    });

    it('should propagate errors from the service', async () => {
      const dto = {} as Parameters<EventsController['create']>[0];
      const error = new Error('Vehicle not found');
      mockEventsService.create.mockRejectedValue(error);

      await expect(controller.create(dto, 'user-1')).rejects.toBe(error);

      expect(mockEventsService.create).toHaveBeenCalledTimes(1);
      expect(mockEventsService.create).toHaveBeenCalledWith(dto, 'user-1');
    });
  });

  describe('update', () => {
    it('should update an event belonging to the user', async () => {
      const dto = {} as Parameters<EventsController['update']>[1];
      const event = { id: 'event-1' };
      mockEventsService.update.mockResolvedValue(event);

      await expect(
        controller.update('event-1', dto, 'user-1'),
      ).resolves.toEqual(event);

      expect(mockEventsService.update).toHaveBeenCalledTimes(1);
      expect(mockEventsService.update).toHaveBeenCalledWith(
        'event-1',
        dto,
        'user-1',
      );
    });

    it('should propagate errors from the service', async () => {
      const dto = {} as Parameters<EventsController['update']>[1];
      const error = new Error('Event not found');
      mockEventsService.update.mockRejectedValue(error);

      await expect(controller.update('event-1', dto, 'user-1')).rejects.toBe(
        error,
      );

      expect(mockEventsService.update).toHaveBeenCalledTimes(1);
      expect(mockEventsService.update).toHaveBeenCalledWith(
        'event-1',
        dto,
        'user-1',
      );
    });
  });

  describe('delete', () => {
    it('should delete an event belonging to the user', async () => {
      mockEventsService.delete.mockResolvedValue(undefined);

      await expect(controller.delete('event-1', 'user-1')).resolves.toEqual({
        message: 'Event deleted successfully',
      });

      expect(mockEventsService.delete).toHaveBeenCalledTimes(1);
      expect(mockEventsService.delete).toHaveBeenCalledWith(
        'event-1',
        'user-1',
      );
    });

    it('should propagate errors from the service', async () => {
      const error = new Error('Event not found');
      mockEventsService.delete.mockRejectedValue(error);

      await expect(controller.delete('event-1', 'user-1')).rejects.toBe(error);

      expect(mockEventsService.delete).toHaveBeenCalledTimes(1);
      expect(mockEventsService.delete).toHaveBeenCalledWith(
        'event-1',
        'user-1',
      );
    });
  });
});
