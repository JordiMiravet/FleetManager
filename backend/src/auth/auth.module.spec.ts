import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';

jest.mock('./auth.controller', () => ({
  AuthController: class AuthController {},
}));

describe('AuthModule', () => {
  it('registers AuthController as its only controller', () => {
    expect(Reflect.getMetadata('controllers', AuthModule)).toEqual([
      AuthController,
    ]);
  });

  it.each(['providers', 'imports', 'exports'])('does not declare %s', (key) => {
    expect(Reflect.getMetadata(key, AuthModule)).toBeUndefined();
  });
});
