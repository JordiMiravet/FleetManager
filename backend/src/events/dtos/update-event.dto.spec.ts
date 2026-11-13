import {
  validateBody,
  validationMessages,
} from '../../common/testing/validate-body';
import { UpdateEventDto } from './update-event.dto';

describe('UpdateEventDto', () => {
  async function messagesFor(payload: object): Promise<string> {
    const messages = await validationMessages(UpdateEventDto, payload);

    return messages.join(' | ');
  }

  it('accepts an update with only the title', async () => {
    await expect(
      validateBody(UpdateEventDto, { title: 'New title' }),
    ).resolves.toBeInstanceOf(UpdateEventDto);
  });

  it('accepts the whole event resent by the frontend', async () => {
    await expect(
      validateBody(UpdateEventDto, {
        title: 'Trip',
        date: '2026-11-10',
        hourStart: '09:00',
        hourEnd: '10:00',
        vehicleId: '507f1f77bcf86cd799439011',
        comment: '',
      }),
    ).resolves.toBeInstanceOf(UpdateEventDto);
  });

  it('rejects an invalid date', async () => {
    expect(await messagesFor({ date: '2026-02-30' })).toContain('date');
  });

  it('rejects an invalid time', async () => {
    expect(await messagesFor({ hourEnd: '25:00' })).toContain('hourEnd');
  });

  it('rejects an invalid vehicle id', async () => {
    expect(await messagesFor({ vehicleId: 'vehicle-1' })).toContain(
      'vehicleId',
    );
  });

  it('rejects an empty title', async () => {
    expect(await messagesFor({ title: '' })).toContain('title');
  });

  it('rejects unknown properties', async () => {
    expect(await messagesFor({ _id: '507f1f77bcf86cd799439011' })).toContain(
      '_id',
    );
  });
});
