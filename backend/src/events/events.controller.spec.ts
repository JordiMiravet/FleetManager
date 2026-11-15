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

      expect(mockEventsService.findAll.mock.calls).toEqual([['user-1']]);
    });
  });

  describe('findOne', () => {
    it('should return an event belonging to the user', async () => {
      const event = { id: 'event-1' };
      mockEventsService.findOne.mockResolvedValue(event);

      await expect(controller.findOne('event-1', 'user-1')).resolves.toEqual(
        event,
      );

      expect(mockEventsService.findOne.mock.calls).toEqual([
        ['event-1', 'user-1'],
      ]);
    });
  });

  describe('create', () => {
    it('should create an event for the user', async () => {
      const dto = {} as Parameters<EventsController['create']>[0];
      const event = { id: 'event-1' };
      mockEventsService.create.mockResolvedValue(event);

      await expect(controller.create(dto, 'user-1')).resolves.toEqual(event);

      expect(mockEventsService.create.mock.calls).toEqual([[dto, 'user-1']]);
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

      expect(mockEventsService.update.mock.calls).toEqual([
        ['event-1', dto, 'user-1'],
      ]);
    });
  });

  describe('delete', () => {
    it('should delete an event belonging to the user', async () => {
      mockEventsService.delete.mockResolvedValue(undefined);

      await expect(controller.delete('event-1', 'user-1')).resolves.toEqual({
        message: 'Event deleted successfully',
      });

      expect(mockEventsService.delete.mock.calls).toEqual([
        ['event-1', 'user-1'],
      ]);
    });
  });
});
