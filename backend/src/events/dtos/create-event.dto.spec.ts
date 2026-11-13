import {
  validateBody,
  validationMessages,
} from '../../common/testing/validate-body';
import { CreateEventDto } from './create-event.dto';

describe('CreateEventDto', () => {
  const validEvent = {
    title: 'Trip',
    date: '2026-11-10',
    hourStart: '09:00',
    hourEnd: '10:00',
    vehicleId: '507f1f77bcf86cd799439011',
    comment: 'Bring the keys',
  };

  async function messagesFor(changes: object): Promise<string> {
    const messages = await validationMessages(CreateEventDto, {
      ...validEvent,
      ...changes,
    });

    return messages.join(' | ');
  }

  it('accepts a valid event', async () => {
    const result = await validateBody(CreateEventDto, validEvent);

    expect(result).toBeInstanceOf(CreateEventDto);
  });

  it('accepts an event without comment', async () => {
    await expect(
      validateBody(CreateEventDto, { ...validEvent, comment: undefined }),
    ).resolves.toBeInstanceOf(CreateEventDto);
  });

  it('accepts an empty or null comment', async () => {
    await expect(
      validateBody(CreateEventDto, { ...validEvent, comment: '' }),
    ).resolves.toBeInstanceOf(CreateEventDto);
    await expect(
      validateBody(CreateEventDto, { ...validEvent, comment: null }),
    ).resolves.toBeInstanceOf(CreateEventDto);
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
    expect(await messagesFor({ date })).toContain('date');
  });

  describe.each(['hourStart', 'hourEnd'])('%s', (field) => {
    it.each(['9:00', '24:00', '12:60', '12:00:00', 'noon', ''])(
      'rejects the invalid time "%s"',
      async (time) => {
        expect(await messagesFor({ [field]: time })).toContain(field);
      },
    );
  });

  it.each(['vehicle-1', '123', 'zzzzzzzzzzzzzzzzzzzzzzzz', ''])(
    'rejects the invalid vehicle id "%s"',
    async (vehicleId) => {
      expect(await messagesFor({ vehicleId })).toContain('vehicleId');
    },
  );

  it.each(['title', 'date', 'hourStart', 'hourEnd', 'vehicleId'])(
    'rejects a missing %s',
    async (field) => {
      expect(await messagesFor({ [field]: undefined })).toContain(field);
    },
  );

  it('rejects an empty title', async () => {
    expect(await messagesFor({ title: '' })).toContain('title');
  });

  it('rejects a title longer than 200 characters', async () => {
    expect(await messagesFor({ title: 'a'.repeat(201) })).toContain('title');
  });

  it('rejects a comment longer than 2000 characters', async () => {
    expect(await messagesFor({ comment: 'a'.repeat(2001) })).toContain(
      'comment',
    );
  });

  it('rejects a comment that is not text', async () => {
    expect(await messagesFor({ comment: 123 })).toContain('comment');
  });

  it('rejects unknown properties', async () => {
    expect(await messagesFor({ userId: 'someone-else' })).toContain('userId');
  });
});
