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
});
