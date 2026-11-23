import {
  validateBody,
  validationMessages,
} from '../../common/testing/validate-body';
import { UpdateVehicleDto } from './update-vehicle.dto';

const location = { lat: 41.4, lng: 2.2 };

async function expectValid(payload: object): Promise<void> {
  await expect(validateBody(UpdateVehicleDto, payload)).resolves.toBeInstanceOf(
    UpdateVehicleDto,
  );
}

async function expectInvalid(payload: object, field: string): Promise<void> {
  const messages = await validationMessages(UpdateVehicleDto, payload);

  expect(messages.join(' | ')).toContain(field);
}

describe('UpdateVehicleDto', () => {
  describe('valid updates', () => {
    it.each<[string, object]>([
      ['the name', { name: 'New name' }],
      ['the model', { model: 'Model Y' }],
      ['the plate', { plate: '9999-XYZ' }],
      ['an empty image', { imageUrl: '' }],
      ['the location', { location }],
    ])('accepts an update with only %s', async (_label, payload) => {
      await expectValid(payload);
    });

    it('accepts an empty update', async () => {
      await expectValid({});
    });

    it('accepts the whole vehicle resent by the frontend', async () => {
      await expectValid({
        name: 'Family car',
        model: 'Model 3',
        plate: '1234-ABC',
        imageUrl: '',
        location,
      });
    });
  });

  describe('invalid updates', () => {
    it.each<[string, object, string]>([
      [
        'a location with only the latitude',
        { location: { lat: 41.4 } },
        'location.lng',
      ],
      [
        'a location with only the longitude',
        { location: { lng: 2.2 } },
        'location.lat',
      ],
      [
        'a latitude out of range',
        { location: { lat: 100, lng: 2 } },
        'location.lat',
      ],
      ['an empty name', { name: '' }, 'name'],
      ['an empty model', { model: '' }, 'model'],
      ['an empty plate', { plate: '' }, 'plate'],
      ['a name longer than 100 characters', { name: 'a'.repeat(101) }, 'name'],
      [
        'an image URL longer than 2048 characters',
        { imageUrl: 'a'.repeat(2049) },
        'imageUrl',
      ],
    ])('rejects %s', async (_label, payload, field) => {
      await expectInvalid(payload, field);
    });
  });

  describe('unknown properties', () => {
    it.each(['users', 'userId'])('rejects "%s"', async (property) => {
      await expectInvalid({ [property]: 'value' }, property);
    });
  });
});
