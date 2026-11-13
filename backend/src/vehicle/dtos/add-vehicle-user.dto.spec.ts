import {
  validateBody,
  validationMessages,
} from '../../common/testing/validate-body';
import { AddVehicleUserDto } from './add-vehicle-user.dto';

describe('AddVehicleUserDto', () => {
  async function messagesFor(payload: object): Promise<string> {
    const messages = await validationMessages(AddVehicleUserDto, payload);

    return messages.join(' | ');
  }

  it('accepts a valid email', async () => {
    const result = await validateBody(AddVehicleUserDto, {
      email: 'user@example.com',
    });

    expect(result.email).toBe('user@example.com');
  });

  it('trims the spaces around the email', async () => {
    const result = await validateBody(AddVehicleUserDto, {
      email: '  user@example.com ',
    });

    expect(result.email).toBe('user@example.com');
  });

  it.each(['not-an-email', 'user@', '@example.com', 'a b@example.com', ''])(
    'rejects the invalid email "%s"',
    async (email) => {
      expect(await messagesFor({ email })).toContain('email');
    },
  );

  it('rejects a missing email', async () => {
    expect(await messagesFor({})).toContain('email');
  });

  it('rejects an email that is not text', async () => {
    expect(await messagesFor({ email: 123 })).toContain('email');
  });

  it('rejects an email longer than 254 characters', async () => {
    expect(
      await messagesFor({ email: `${'a'.repeat(250)}@example.com` }),
    ).toContain('email');
  });

  it('rejects unknown properties', async () => {
    expect(
      await messagesFor({ email: 'user@example.com', userId: 'someone' }),
    ).toContain('userId');
  });
});
