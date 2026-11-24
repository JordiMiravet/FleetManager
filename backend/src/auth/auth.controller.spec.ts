import { RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { AuthController } from './auth.controller';
import type { AuthenticatedUser } from './authenticated-request';
import { FirebaseAuthGuard } from './firebase-auth.guard';

// @nestjs/config is an ES module that Jest cannot load in this CommonJS setup.
jest.mock('./firebase-auth.guard', () => ({
  FirebaseAuthGuard: class FirebaseAuthGuard {},
}));

const user = { uid: 'user-1', email: 'user@example.com' } as AuthenticatedUser;

const verifyTokenHandler = (
  Object.getOwnPropertyDescriptor(
    AuthController.prototype,
    'verifyToken',
  ) as PropertyDescriptor
).value as object;

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(() => {
    controller = new AuthController();
  });

  describe('verifyToken', () => {
    it('returns the confirmation message', () => {
      expect(controller.verifyToken(user).message).toBe('User verified');
    });

    it('returns the received user untouched', () => {
      expect(controller.verifyToken(user).user).toBe(user);
    });
  });

  describe('routing', () => {
    it('is mounted under the auth path', () => {
      expect(Reflect.getMetadata(PATH_METADATA, AuthController)).toBe('auth');
    });

    it('exposes verifyToken on the verify path', () => {
      expect(Reflect.getMetadata(PATH_METADATA, verifyTokenHandler)).toBe(
        'verify',
      );
    });

    it('handles verifyToken with POST', () => {
      expect(Reflect.getMetadata(METHOD_METADATA, verifyTokenHandler)).toBe(
        RequestMethod.POST,
      );
    });

    it('protects verifyToken with FirebaseAuthGuard', () => {
      expect(Reflect.getMetadata(GUARDS_METADATA, verifyTokenHandler)).toEqual([
        FirebaseAuthGuard,
      ]);
    });
  });
});
