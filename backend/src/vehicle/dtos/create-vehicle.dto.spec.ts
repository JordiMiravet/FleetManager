import {
  validateBody,
  validationMessages,
} from '../../common/testing/validate-body';
import { CreateVehicleDto } from './create-vehicle.dto';

const validVehicle = {
  name: 'Family car',
  model: 'Model 3',
  plate: '1234-ABC',
  location: { lat: 41.4, lng: 2.2 },
  imageUrl: 'https://example.com/car.png',
};

async function expectValid(changes: object = {}): Promise<void> {
  await expect(
    validateBody(CreateVehicleDto, { ...validVehicle, ...changes }),
  ).resolves.toBeInstanceOf(CreateVehicleDto);
}

async function expectInvalid(changes: object, field: string): Promise<void> {
  const messages = await validationMessages(CreateVehicleDto, {
    ...validVehicle,
    ...changes,
  });

  expect(messages.join(' | ')).toContain(field);
}

describe('CreateVehicleDto', () => {
  it('accepts a valid vehicle', async () => {
    await expectValid();
  });

  describe.each<[string, number]>([
    ['name', 100],
    ['model', 100],
    ['plate', 20],
  ])('%s', (field, maxLength) => {
    it(`accepts ${maxLength} characters`, async () => {
      await expectValid({ [field]: 'a'.repeat(maxLength) });
    });

    it.each<[string, unknown]>([
      ['empty', ''],
      ['missing', undefined],
      ['not text', 123],
    ])('rejects a value that is %s', async (_label, value) => {
      await expectInvalid({ [field]: value }, field);
    });

    it(`rejects more than ${maxLength} characters`, async () => {
      await expectInvalid({ [field]: 'a'.repeat(maxLength + 1) }, field);
    });
  });

  describe('imageUrl', () => {
    it.each<[string, unknown]>([
      ['omitted', undefined],
      ['empty, as the frontend sends it without an image', ''],
      ['2048 characters long', 'a'.repeat(2048)],
    ])('accepts an image URL that is %s', async (_label, imageUrl) => {
      await expectValid({ imageUrl });
    });

    it.each<[string, unknown]>([
      ['longer than 2048 characters', 'a'.repeat(2049)],
      ['not text', 123],
    ])('rejects an image URL that is %s', async (_label, imageUrl) => {
      await expectInvalid({ imageUrl }, 'imageUrl');
    });
  });

  describe('location', () => {
    it.each<[string, object]>([
      ['the lowest latitude', { lat: -90, lng: 0 }],
      ['the highest latitude', { lat: 90, lng: 0 }],
      [
        'a longitude beyond 180 produced by a wrapped map',
        { lat: 41.4, lng: 190 },
      ],
      ['the origin', { lat: 0, lng: 0 }],
    ])('accepts %s', async (_label, location) => {
      await expectValid({ location });
    });

    it('rejects a missing location', async () => {
      await expectInvalid({ location: undefined }, 'location');
    });

    it.each<[string, object, string]>([
      ['a latitude above 90', { lat: 91, lng: 2.2 }, 'location.lat'],
      ['a latitude below -90', { lat: -91, lng: 2.2 }, 'location.lat'],
      ['a latitude as text', { lat: '41.4', lng: 2.2 }, 'location.lat'],
      ['a longitude as text', { lat: 41.4, lng: '2.2' }, 'location.lng'],
      ['a missing longitude', { lat: 41.4 }, 'location.lng'],
      ['a missing latitude', { lng: 2.2 }, 'location.lat'],
      ['a null latitude', { lat: null, lng: 2.2 }, 'location.lat'],
      ['an empty location', {}, 'location.lat'],
      ['a NaN latitude', { lat: NaN, lng: 2.2 }, 'location.lat'],
      ['an infinite longitude', { lat: 1, lng: Infinity }, 'location.lng'],
    ])('rejects %s', async (_label, location, expected) => {
      await expectInvalid({ location }, expected);
    });

    it('rejects unknown properties inside the location', async () => {
      await expectInvalid(
        { location: { lat: 1, lng: 2, altitude: 3 } },
        'altitude',
      );
    });
  });

  describe('unknown properties', () => {
    it('rejects a property that is not part of the vehicle', async () => {
      await expectInvalid({ userId: 'someone-else' }, 'userId');
    });
  });
});
