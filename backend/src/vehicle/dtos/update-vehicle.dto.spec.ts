import {
  validateBody,
  validationMessages,
} from '../../common/testing/validate-body';
import { UpdateVehicleDto } from './update-vehicle.dto';

describe('UpdateVehicleDto', () => {
  const location = { lat: 41.4, lng: 2.2 };

  async function messagesFor(payload: object): Promise<string> {
    const messages = await validationMessages(UpdateVehicleDto, payload);

    return messages.join(' | ');
  }

  it('accepts an update with only the location', async () => {
    await expect(
      validateBody(UpdateVehicleDto, { location }),
    ).resolves.toBeInstanceOf(UpdateVehicleDto);
  });

  it('accepts a partial update of the details', async () => {
    await expect(
      validateBody(UpdateVehicleDto, { name: 'New name' }),
    ).resolves.toBeInstanceOf(UpdateVehicleDto);
  });

  it('accepts the whole vehicle resent by the frontend', async () => {
    await expect(
      validateBody(UpdateVehicleDto, {
        name: 'Family car',
        model: 'Model 3',
        plate: '1234-ABC',
        imageUrl: '',
        location,
      }),
    ).resolves.toBeInstanceOf(UpdateVehicleDto);
  });

  it('requires both coordinates when a location is sent', async () => {
    expect(await messagesFor({ location: { lat: 41.4 } })).toContain(
      'location.lng',
    );
  });

  it('rejects a latitude out of range', async () => {
    expect(await messagesFor({ location: { lat: 100, lng: 2 } })).toContain(
      'location.lat',
    );
  });

  it.each(['name', 'model', 'plate'])('rejects an empty %s', async (field) => {
    expect(await messagesFor({ [field]: '' })).toContain(field);
  });

  it('rejects unknown properties', async () => {
    expect(await messagesFor({ users: [] })).toContain('users');
  });
});
