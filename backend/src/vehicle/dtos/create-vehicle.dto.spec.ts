import {
  validateBody,
  validationMessages,
} from '../../common/testing/validate-body';
import { CreateVehicleDto } from './create-vehicle.dto';

describe('CreateVehicleDto', () => {
  const validVehicle = {
    name: 'Family car',
    model: 'Model 3',
    plate: '1234-ABC',
    location: { lat: 41.4, lng: 2.2 },
    imageUrl: 'https://example.com/car.png',
  };

  async function messagesFor(changes: object): Promise<string> {
    const messages = await validationMessages(CreateVehicleDto, {
      ...validVehicle,
      ...changes,
    });

    return messages.join(' | ');
  }

  it('accepts a valid vehicle', async () => {
    const result = await validateBody(CreateVehicleDto, validVehicle);

    expect(result).toBeInstanceOf(CreateVehicleDto);
    expect(result.location).toEqual(validVehicle.location);
  });

  it('accepts a vehicle without image', async () => {
    await expect(
      validateBody(CreateVehicleDto, { ...validVehicle, imageUrl: undefined }),
    ).resolves.toBeInstanceOf(CreateVehicleDto);
  });

  it('accepts the empty image that the frontend sends when no image is set', async () => {
    await expect(
      validateBody(CreateVehicleDto, { ...validVehicle, imageUrl: '' }),
    ).resolves.toBeInstanceOf(CreateVehicleDto);
  });

  it('accepts the limits of the latitude range', async () => {
    await expect(
      validateBody(CreateVehicleDto, {
        ...validVehicle,
        location: { lat: -90, lng: 180 },
      }),
    ).resolves.toBeInstanceOf(CreateVehicleDto);
  });

  it('accepts a longitude beyond 180 produced by a wrapped map', async () => {
    await expect(
      validateBody(CreateVehicleDto, {
        ...validVehicle,
        location: { lat: 41.4, lng: 190 },
      }),
    ).resolves.toBeInstanceOf(CreateVehicleDto);
  });

  it.each(['name', 'model', 'plate'])('rejects an empty %s', async (field) => {
    expect(await messagesFor({ [field]: '' })).toContain(field);
  });

  it.each(['name', 'model', 'plate'])('rejects a missing %s', async (field) => {
    expect(await messagesFor({ [field]: undefined })).toContain(field);
  });

  it('rejects a name that is not text', async () => {
    expect(await messagesFor({ name: 123 })).toContain('name');
  });

  it('rejects a name longer than 100 characters', async () => {
    expect(await messagesFor({ name: 'a'.repeat(101) })).toContain('name');
  });

  it('rejects a model longer than 100 characters', async () => {
    expect(await messagesFor({ model: 'a'.repeat(101) })).toContain('model');
  });

  it('rejects a plate longer than 20 characters', async () => {
    expect(await messagesFor({ plate: 'a'.repeat(21) })).toContain('plate');
  });

  it('rejects an image URL longer than 2048 characters', async () => {
    expect(await messagesFor({ imageUrl: 'a'.repeat(2049) })).toContain(
      'imageUrl',
    );
  });

  it('rejects a vehicle without location', async () => {
    expect(await messagesFor({ location: undefined })).toContain('location');
  });

  it.each([
    ['latitude above 90', { lat: 91, lng: 2.2 }, 'location.lat'],
    ['latitude below -90', { lat: -91, lng: 2.2 }, 'location.lat'],
    ['latitude as text', { lat: '41.4', lng: 2.2 }, 'location.lat'],
    ['longitude as text', { lat: 41.4, lng: '2.2' }, 'location.lng'],
    ['a missing longitude', { lat: 41.4 }, 'location.lng'],
    ['a missing latitude', { lng: 2.2 }, 'location.lat'],
    ['a null latitude', { lat: null, lng: 2.2 }, 'location.lat'],
  ])('rejects %s', async (_description, location, expected) => {
    expect(await messagesFor({ location })).toContain(expected);
  });

  it('rejects unknown properties', async () => {
    expect(await messagesFor({ userId: 'someone-else' })).toContain('userId');
  });

  it('rejects unknown properties inside the location', async () => {
    expect(
      await messagesFor({ location: { lat: 1, lng: 2, altitude: 3 } }),
    ).toContain('altitude');
  });
});
