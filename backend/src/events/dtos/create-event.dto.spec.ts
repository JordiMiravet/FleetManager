import {
  validateBody,
  validationMessages,
} from '../../common/testing/validate-body';
import { CreateEventDto } from './create-event.dto';

const validEvent = {
  title: 'Trip',
  date: '2026-11-10',
  hourStart: '09:00',
  hourEnd: '10:00',
  vehicleId: '507f1f77bcf86cd799439011',
  comment: 'Bring the keys',
};

const INVALID_TIMES = ['9:00', '24:00', '12:60', '12:00:00', 'noon', ''];

async function expectValid(changes: object = {}): Promise<void> {
  await expect(
    validateBody(CreateEventDto, { ...validEvent, ...changes }),
  ).resolves.toBeInstanceOf(CreateEventDto);
}

async function expectInvalid(changes: object, field: string): Promise<void> {
  const messages = await validationMessages(CreateEventDto, {
    ...validEvent,
    ...changes,
  });

  expect(messages.join(' | ')).toContain(field);
}

describe('CreateEventDto', () => {
  it('accepts a valid event', async () => {
    await expectValid();
  });

  describe('title', () => {
    it('accepts 200 characters', async () => {
      await expectValid({ title: 'a'.repeat(200) });
    });

    it.each<[string, unknown]>([
      ['missing', undefined],
      ['empty', ''],
      ['longer than 200 characters', 'a'.repeat(201)],
      ['not text', 123],
    ])('rejects a title that is %s', async (_label, title) => {
      await expectInvalid({ title }, 'title');
    });
  });

  describe('date', () => {
    it.each(['2026-11-10', '2024-02-29'])('accepts "%s"', async (date) => {
      await expectValid({ date });
    });

    it.each([
      '10/11/2026',
      '2026-1-5',
      '2026-11-10T09:00:00Z',
      '2026-02-30',
      '2026-13-01',
      'tomorrow',
      '',
    ])('rejects the invalid date "%s"', async (date) => {
      await expectInvalid({ date }, 'date');
    });

    it('rejects a missing date', async () => {
      await expectInvalid({ date: undefined }, 'date');
    });
  });

  describe.each(['hourStart', 'hourEnd'])('%s', (field) => {
    it.each(['00:00', '23:59'])('accepts "%s"', async (time) => {
      await expectValid({ [field]: time });
    });

    it.each(INVALID_TIMES)('rejects the invalid time "%s"', async (time) => {
      await expectInvalid({ [field]: time }, field);
    });

    it('rejects a missing value', async () => {
      await expectInvalid({ [field]: undefined }, field);
    });
  });

  describe('vehicleId', () => {
    it.each(['vehicle-1', '123', 'zzzzzzzzzzzzzzzzzzzzzzzz', ''])(
      'rejects the invalid id "%s"',
      async (vehicleId) => {
        await expectInvalid({ vehicleId }, 'vehicleId');
      },
    );

    it('rejects a missing id', async () => {
      await expectInvalid({ vehicleId: undefined }, 'vehicleId');
    });
  });

  describe('comment', () => {
    it.each<[string, unknown]>([
      ['omitted', undefined],
      ['empty', ''],
      ['null', null],
      ['2000 characters long', 'a'.repeat(2000)],
    ])('accepts a comment that is %s', async (_label, comment) => {
      await expectValid({ comment });
    });

    it.each<[string, unknown]>([
      ['longer than 2000 characters', 'a'.repeat(2001)],
      ['not text', 123],
    ])('rejects a comment that is %s', async (_label, comment) => {
      await expectInvalid({ comment }, 'comment');
    });
  });

  describe('unknown properties', () => {
    it('rejects a property that is not part of the event', async () => {
      await expectInvalid({ userId: 'someone-else' }, 'userId');
    });
  });
});
