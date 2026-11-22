import { Connection } from 'mongoose';
import { AppService } from './app.service';

const createService = (connection: { readyState: number }) =>
  new AppService(connection as Connection);

describe('AppService', () => {
  describe('checkConnection', () => {
    it.each([
      [0, 'Disconnected'],
      [1, 'Connected'],
      [2, 'Connecting'],
      [3, 'Disconnecting'],
    ])('maps the state %i to "%s"', async (readyState, expected) => {
      const service = createService({ readyState });

      await expect(service.checkConnection()).resolves.toBe(expected);
    });

    it.each([4, 99, -1])(
      'returns "Unknown" for the state %i',
      async (state) => {
        const service = createService({ readyState: state });

        await expect(service.checkConnection()).resolves.toBe('Unknown');
      },
    );

    it('reads the current state on every call', async () => {
      const connection = { readyState: 1 };
      const service = createService(connection);

      await expect(service.checkConnection()).resolves.toBe('Connected');

      connection.readyState = 0;

      await expect(service.checkConnection()).resolves.toBe('Disconnected');
    });
  });
});
