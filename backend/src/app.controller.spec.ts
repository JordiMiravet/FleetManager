import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let appService: jest.Mocked<AppService>;

  beforeEach(async () => {
    const mockAppService = {
      checkConnection: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    appService = module.get(AppService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkDB', () => {
    it('should return the database connection status', async () => {
      appService.checkConnection.mockResolvedValue('Connected');

      await expect(controller.checkDB()).resolves.toBe('Connected');

      expect(appService.checkConnection.mock.calls).toHaveLength(1);
    });
  });
});
