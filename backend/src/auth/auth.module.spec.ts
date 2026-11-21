import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';

jest.mock('./auth.controller', () => ({
  AuthController: class AuthController {},
}));

describe('AuthModule', () => {

});
