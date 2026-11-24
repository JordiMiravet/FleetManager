import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../config/environment-variables';
import { FirebaseService } from './firebase.service';

// @nestjs/config is published as an ES module, which Jest cannot load in this
// CommonJS setup. Only the ConfigService token is needed in this spec.
jest.mock('@nestjs/config', () => ({
  ConfigService: class ConfigService {},
}));

jest.mock('firebase-admin', () => {
  const authMocks = { verifyIdToken: jest.fn(), getUserByEmail: jest.fn() };
  const app = { auth: () => authMocks };

  return {
    apps: [] as unknown[],
    app: jest.fn(() => app),
    initializeApp: jest.fn(() => app),
    credential: { cert: jest.fn((serviceAccount: unknown) => serviceAccount) },
    authMocks,
  };
});

interface FirebaseAdminMock {
  apps: unknown[];
  app: jest.Mock;
  initializeApp: jest.Mock;
  credential: { cert: jest.Mock };
  authMocks: { verifyIdToken: jest.Mock; getUserByEmail: jest.Mock };
}

const firebaseMock = jest.requireMock<FirebaseAdminMock>('firebase-admin');
const { authMocks } = firebaseMock;

const CONFIG: Record<string, string> = {
  FIREBASE_PROJECT_ID: 'project-id',
  FIREBASE_CLIENT_EMAIL: 'client@example.com',
  FIREBASE_PRIVATE_KEY: 'line1\\nline2',
};

const configService = {
  get: jest.fn((key: string) => CONFIG[key]),
} as unknown as ConfigService<EnvironmentVariables, true>;

const createService = () => new FirebaseService(configService);

describe('FirebaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    firebaseMock.apps.length = 0;
  });

  describe('constructor', () => {
    describe('when Firebase Admin is not initialized yet', () => {
      it('builds the service account from the configuration', () => {
        createService();

        expect(firebaseMock.credential.cert).toHaveBeenCalledWith({
          projectId: 'project-id',
          clientEmail: 'client@example.com',
          privateKey: 'line1\nline2',
        });
      });

      it('restores the line breaks of the private key', () => {
        createService();

        expect(firebaseMock.credential.cert).toHaveBeenCalledWith(
          expect.objectContaining({ privateKey: 'line1\nline2' }),
        );
      });

      it('initializes Firebase Admin once with those credentials', () => {
        createService();

        expect(firebaseMock.initializeApp).toHaveBeenCalledTimes(1);
        expect(firebaseMock.initializeApp).toHaveBeenCalledWith({
          credential: {
            projectId: 'project-id',
            clientEmail: 'client@example.com',
            privateKey: 'line1\nline2',
          },
        });
      });
    });

    describe('when Firebase Admin is already initialized', () => {
      beforeEach(() => {
        firebaseMock.apps.push({});
      });

      it('reuses the existing app', () => {
        createService();

        expect(firebaseMock.app).toHaveBeenCalledTimes(1);
        expect(firebaseMock.initializeApp).not.toHaveBeenCalled();
      });

      it('does not build new credentials', () => {
        createService();

        expect(firebaseMock.credential.cert).not.toHaveBeenCalled();
      });
    });
  });

  describe('verifyIdToken', () => {
    it('returns the decoded token', async () => {
      authMocks.verifyIdToken.mockResolvedValue({ uid: 'user-1' });

      await expect(createService().verifyIdToken('token')).resolves.toEqual({
        uid: 'user-1',
      });
      expect(authMocks.verifyIdToken).toHaveBeenCalledWith('token');
    });

    it('propagates the verification error', async () => {
      const error = new Error('Invalid token');
      authMocks.verifyIdToken.mockRejectedValue(error);

      await expect(createService().verifyIdToken('invalid')).rejects.toBe(
        error,
      );
    });
  });

  describe('getUserByEmail', () => {
    it('returns the user record', async () => {
      authMocks.getUserByEmail.mockResolvedValue({ uid: 'user-2' });

      await expect(
        createService().getUserByEmail('user@example.com'),
      ).resolves.toEqual({ uid: 'user-2' });
      expect(authMocks.getUserByEmail).toHaveBeenCalledWith('user@example.com');
    });

    it('propagates the lookup error', async () => {
      const error = new Error('User not found');
      authMocks.getUserByEmail.mockRejectedValue(error);

      await expect(
        createService().getUserByEmail('unknown@example.com'),
      ).rejects.toBe(error);
    });
  });
});
