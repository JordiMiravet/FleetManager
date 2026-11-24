import {
  validateBody,
  validationMessages,
} from '../../common/testing/validate-body';
import { AddVehicleUserDto } from './add-vehicle-user.dto';

async function expectInvalid(payload: object, field: string): Promise<void> {
  const messages = await validationMessages(AddVehicleUserDto, payload);

  expect(messages.join(' | ')).toContain(field);
}

describe('AddVehicleUserDto', () => {
  describe('valid emails', () => {
    it.each([
      ['a plain email', 'user@example.com', 'user@example.com'],
      ['spaces around it', '  user@example.com ', 'user@example.com'],
      ['a plus tag', 'user+tag@example.com', 'user+tag@example.com'],
    ])('accepts %s', async (_label, email, expected) => {
      const result = await validateBody(AddVehicleUserDto, { email });

      expect(result.email).toBe(expected);
    });
  });

  describe('invalid emails', () => {
    it.each([
      'not-an-email',
      'user@',
      '@example.com',
      'a b@example.com',
      '',
      '   ',
    ])('rejects the email "%s"', async (email) => {
      await expectInvalid({ email }, 'email');
    });

    it('rejects a missing email', async () => {
      await expectInvalid({}, 'email');
    });

    it.each<[string, unknown]>([
      ['a number', 123],
      ['null', null],
    ])('rejects %s', async (_label, email) => {
      await expectInvalid({ email }, 'email');
    });

    it('rejects an email longer than 254 characters', async () => {
      await expectInvalid({ email: `${'a'.repeat(250)}@example.com` }, 'email');
    });
  });

  describe('unknown properties', () => {
    it('rejects a property that is not part of the body', async () => {
      await expectInvalid(
        { email: 'user@example.com', userId: 'someone' },
        'userId',
      );
    });
  });
});
