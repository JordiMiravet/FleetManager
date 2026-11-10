import {
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseService } from './firebase/firebase.service';

// The real service imports @nestjs/config, an ES module that Jest cannot load
// in this CommonJS setup. The guard only needs the class as an injection token.
jest.mock('./firebase/firebase.service', () => ({
  FirebaseService: class FirebaseService {},
}));

function createContext(request: object): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let verifyIdToken: jest.Mock;

  beforeEach(() => {
    verifyIdToken = jest.fn();
    guard = new FirebaseAuthGuard({
      verifyIdToken,
    } as unknown as FirebaseService);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects a request without authorization header', async () => {
    const context = createContext({ headers: {} });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('No token provided'),
    );
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects an authorization header that is not a Bearer token', async () => {
    const context = createContext({ headers: { authorization: 'Basic abc' } });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid token'),
    );
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects a Bearer header without a token', async () => {
    const context = createContext({ headers: { authorization: 'Bearer' } });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid token'),
    );
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects a token that Firebase cannot verify', async () => {
    verifyIdToken.mockRejectedValue(new Error('expired'));
    const context = createContext({
      headers: { authorization: 'Bearer expired-token' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid token'),
    );
    expect(Logger.prototype.warn).toHaveBeenCalled();
  });

  it('accepts a valid token and stores the user in the request', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'user-1' });
    const request: { headers: object; user?: unknown } = {
      headers: { authorization: 'Bearer valid-token' },
    };

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(verifyIdToken).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual({ uid: 'user-1' });
  });
});
