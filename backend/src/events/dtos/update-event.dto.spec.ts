import {
  validateBody,
  validationMessages,
} from '../../common/testing/validate-body';
import { UpdateEventDto } from './update-event.dto';

async function expectValid(payload: object): Promise<void> {
  await expect(validateBody(UpdateEventDto, payload)).resolves.toBeInstanceOf(
    UpdateEventDto,
  );
}

async function expectInvalid(payload: object, field: string): Promise<void> {
  const messages = await validationMessages(UpdateEventDto, payload);

  expect(messages.join(' | ')).toContain(field);
}

describe('UpdateEventDto', () => {
  describe('valid updates', () => {
    it.each<[string, unknown]>([
      ['title', 'New title'],
      ['date', '2026-11-10'],
      ['hourStart', '09:00'],
      ['hourEnd', '10:00'],
      ['vehicleId', '507f1f77bcf86cd799439011'],
      ['comment', 'Note'],
    ])('accepts an update with only the %s', async (field, value) => {
      await expectValid({ [field]: value });
    });

    it('accepts an empty update', async () => {
      await expectValid({});
    });

    it('accepts the whole event resent by the frontend', async () => {
      await expectValid({
        title: 'Trip',
        date: '2026-11-10',
        hourStart: '09:00',
        hourEnd: '10:00',
        vehicleId: '507f1f77bcf86cd799439011',
        comment: '',
      });
    });
  });

  describe('invalid updates', () => {
    it.each<[string, string, unknown]>([
      ['an invalid date', 'date', '2026-02-30'],
      ['an invalid start time', 'hourStart', '9:00'],
      ['an invalid end time', 'hourEnd', '25:00'],
      ['an invalid vehicle id', 'vehicleId', 'vehicle-1'],
      ['an empty title', 'title', ''],
      ['a title longer than 200 characters', 'title', 'a'.repeat(201)],
      ['a comment longer than 2000 characters', 'comment', 'a'.repeat(2001)],
    ])('rejects %s', async (_label, field, value) => {
      await expectInvalid({ [field]: value }, field);
    });
  });

  describe('unknown properties', () => {
    it.each(['_id', 'userId'])('rejects "%s"', async (property) => {
      await expectInvalid({ [property]: 'value' }, property);
    });
  });
});
