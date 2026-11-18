import { Connection } from 'mongoose';
import { AppService } from './app.service';

describe('AppService', () => {
  const serviceWithState = (readyState: number) =>
    new AppService({ readyState } as Connection);

  it.each([
    [0, 'Disconnected'],
    [1, 'Connected'],
    [2, 'Connecting'],
    [3, 'Disconnecting'],
  ])('maps readyState %i to "%s"', async (readyState, expected) => {
    await expect(serviceWithState(readyState).checkConnection()).resolves.toBe(
      expected,
    );
  });

  it('returns "Unknown" for an unexpected readyState', async () => {
    await expect(serviceWithState(99).checkConnection()).resolves.toBe(
      'Unknown',
    );
  });
});
