import { AuthController } from './auth.controller';
import type { AuthenticatedUser } from './authenticated-request';

// The guard pulls in Firebase and @nestjs/config, which Jest cannot load.
// It is irrelevant for this unit test, so it is replaced by an empty class.
jest.mock('./firebase-auth.guard', () => ({
  FirebaseAuthGuard: class {},
}));

describe('AuthController', () => {
  it('verifyToken returns a confirmation message with the current user', () => {
    const user = {
      uid: 'user-1',
      email: 'user@example.com',
    } as AuthenticatedUser;

    expect(new AuthController().verifyToken(user)).toEqual({
      message: 'User verified',
      user,
    });
  });
});
