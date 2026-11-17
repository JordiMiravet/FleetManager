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

describe('CurrentUser', () => {
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
      switchToHttp: () => ({
        getRequest: () => request,
      }),
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

    const routeMetadata = Object.values(metadata)[0];

    return routeMetadata.factory(
      routeMetadata.data,
      createContext(authenticatedUser),
    );
  };

  it('should return the complete authenticated user', () => {
    expect(executeDecorator(undefined, user)).toBe(user);
  });

  it('should return the requested user field', () => {
    expect(executeDecorator('uid', user)).toBe('user-123');
  });

  it('should return the email when requested', () => {
    expect(executeDecorator('email', user)).toBe('test@example.com');
  });

  it('should return undefined when the user is not authenticated', () => {
    expect(executeDecorator('uid')).toBeUndefined();
  });

  it('should return undefined when requesting the complete user and no user exists', () => {
    expect(executeDecorator()).toBeUndefined();
  });
});
