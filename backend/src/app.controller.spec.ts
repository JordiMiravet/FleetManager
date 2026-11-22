import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const checkDBHandler = (
  Object.getOwnPropertyDescriptor(
    AppController.prototype,
    'checkDB',
  ) as PropertyDescriptor
).value as object;

describe('AppController', () => {
  let controller: AppController;
  let appService: jest.Mocked<AppService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AppService, useValue: { checkConnection: jest.fn() } },
      ],
    }).compile();

    controller = moduleRef.get(AppController);
    appService = moduleRef.get(AppService);
  });

  describe('checkDB', () => {
    it.each(['Connected', 'Disconnected'])(
      'returns the "%s" status reported by the service',
      async (status) => {
        appService.checkConnection.mockResolvedValue(status);

        await expect(controller.checkDB()).resolves.toBe(status);
      },
    );

    it('queries the connection state once', async () => {
      appService.checkConnection.mockResolvedValue('Connected');

      await controller.checkDB();

      expect(appService.checkConnection).toHaveBeenCalledTimes(1);
    });

    it('propagates the error of the service', async () => {
      const error = new Error('Connection failed');
      appService.checkConnection.mockRejectedValue(error);

      await expect(controller.checkDB()).rejects.toBe(error);
    });
  });

  describe('routing', () => {
    it('exposes checkDB on the check-db path', () => {
      expect(Reflect.getMetadata(PATH_METADATA, checkDBHandler)).toBe(
        'check-db',
      );
    });

    it('handles checkDB with GET', () => {
      expect(Reflect.getMetadata(METHOD_METADATA, checkDBHandler)).toBe(
        RequestMethod.GET,
      );
    });
  });
});
