import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import type { ExecutionContext } from '@nestjs/common';
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
} from './authenticated-request';
import { CurrentUser } from './current-user.decorator';

interface CustomRouteMetadata {
  factory: (
    data: keyof AuthenticatedUser | undefined,
    context: ExecutionContext,
  ) => unknown;
  data: keyof AuthenticatedUser | undefined;
}

class TestController {
  handler(): void {}
}

const user = {
  uid: 'user-123',
  email: 'test@example.com',
  email_verified: true,
} as AuthenticatedUser;

const createContext = (
  authenticatedUser?: AuthenticatedUser,
): ExecutionContext => {
  const request: AuthenticatedRequest = {
    headers: {},
    user: authenticatedUser,
  };

  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
};

const executeDecorator = (
  field?: keyof AuthenticatedUser,
  authenticatedUser?: AuthenticatedUser,
): unknown => {
  CurrentUser(field)(TestController.prototype, 'handler', 0);

  const metadata = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestController,
    'handler',
  ) as Record<string, CustomRouteMetadata>;
  const { factory, data } = Object.values(metadata)[0];

  return factory(data, createContext(authenticatedUser));
};

describe('CurrentUser', () => {
  describe('without a field', () => {
    it('returns the authenticated user', () => {
      expect(executeDecorator(undefined, user)).toBe(user);
    });

    it('returns undefined when there is no authenticated user', () => {
      expect(executeDecorator()).toBeUndefined();
    });
  });

  describe('with a field', () => {
    const fields: [keyof AuthenticatedUser, unknown][] = [
      ['uid', 'user-123'],
      ['email', 'test@example.com'],
      ['email_verified', true],
    ];

    it.each(fields)('returns the %s field of the user', (field, expected) => {
      expect(executeDecorator(field, user)).toBe(expected);
    });

    it('returns undefined when the user does not have that field', () => {
      expect(executeDecorator('name', user)).toBeUndefined();
    });

    it('returns undefined when there is no authenticated user', () => {
      expect(executeDecorator('uid')).toBeUndefined();
    });
  });
});
