import {
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseService } from './firebase/firebase.service';

// @nestjs/config is an ES module that Jest cannot load in this CommonJS setup.
jest.mock('./firebase/firebase.service', () => ({
  FirebaseService: class FirebaseService {},
}));

interface TestRequest {
  headers: { authorization?: string };
  user?: unknown;
}

const createRequest = (authorization?: string): TestRequest => ({
  headers: { authorization },
});

const createContext = (request: TestRequest): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let verifyIdToken: jest.Mock;
  let warnSpy: jest.SpyInstance;

  const canActivate = (request: TestRequest) =>
    guard.canActivate(createContext(request));

  beforeEach(() => {
    verifyIdToken = jest.fn();
    guard = new FirebaseAuthGuard({
      verifyIdToken,
    } as unknown as FirebaseService);
    warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('canActivate', () => {
    describe('without an authorization header', () => {
      it('rejects the request', async () => {
        await expect(canActivate(createRequest())).rejects.toThrow(
          new UnauthorizedException('No token provided'),
        );
      });

      it('does not verify any token', async () => {
        await canActivate(createRequest()).catch(() => undefined);

        expect(verifyIdToken).not.toHaveBeenCalled();
      });
    });

    describe('with a malformed authorization header', () => {
      it.each<[string, string]>([
        ['a non-Bearer scheme', 'Basic abc'],
        ['a lowercase scheme', 'bearer abc'],
        ['a Bearer scheme without token', 'Bearer'],
        ['a Bearer scheme with an empty token', 'Bearer '],
      ])('rejects %s', async (_label, header) => {
        await expect(canActivate(createRequest(header))).rejects.toThrow(
          new UnauthorizedException('Invalid token'),
        );
        expect(verifyIdToken).not.toHaveBeenCalled();
      });
    });

    describe('with a valid token', () => {
      it('allows the request', async () => {
        verifyIdToken.mockResolvedValue({ uid: 'user-1' });

        await expect(
          canActivate(createRequest('Bearer valid-token')),
        ).resolves.toBe(true);
        expect(verifyIdToken).toHaveBeenCalledWith('valid-token');
      });

      it('stores the verified user in the request', async () => {
        verifyIdToken.mockResolvedValue({ uid: 'user-1' });
        const request = createRequest('Bearer valid-token');

        await canActivate(request);

        expect(request.user).toEqual({ uid: 'user-1' });
      });
    });

    describe('when the token verification fails', () => {
      it.each<[string, unknown, string]>([
        ['an Error', new Error('expired'), 'expired'],
        [
          'a value that is not an Error',
          'Firebase unavailable',
          'Firebase unavailable',
        ],
      ])(
        'rejects the request when it fails with %s',
        async (_label, failure, reason) => {
          verifyIdToken.mockRejectedValue(failure);
          const request = createRequest('Bearer bad-token');

          await expect(canActivate(request)).rejects.toThrow(
            new UnauthorizedException('Invalid token'),
          );
          expect(warnSpy).toHaveBeenCalledWith(
            `Token verification failed: ${reason}`,
          );
          expect(request.user).toBeUndefined();
        },
      );
    });
  });
});
