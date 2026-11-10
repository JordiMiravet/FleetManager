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

const firebaseMock = jest.requireMock('firebase-admin') as FirebaseAdminMock;

const configValues: Record<string, string> = {
  FIREBASE_PROJECT_ID: 'project-id',
  FIREBASE_CLIENT_EMAIL: 'client@example.com',
  FIREBASE_PRIVATE_KEY: 'line1\\nline2',
};

const configService = {
  get: jest.fn((key: string) => configValues[key]),
} as unknown as ConfigService<EnvironmentVariables, true>;

describe('FirebaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    firebaseMock.apps.length = 0;
  });

  it('initializes Firebase Admin with the configured credentials', () => {
    new FirebaseService(configService);

    expect(firebaseMock.credential.cert).toHaveBeenCalledWith({
      projectId: 'project-id',
      clientEmail: 'client@example.com',
      privateKey: 'line1\nline2',
    });
    expect(firebaseMock.initializeApp).toHaveBeenCalledTimes(1);
  });

  it('reuses the Firebase app when it is already initialized', () => {
    firebaseMock.apps.push({});

    new FirebaseService(configService);

    expect(firebaseMock.initializeApp).not.toHaveBeenCalled();
    expect(firebaseMock.app).toHaveBeenCalledTimes(1);
  });

  it('verifies an ID token', async () => {
    firebaseMock.authMocks.verifyIdToken.mockResolvedValue({ uid: 'user-1' });
    const service = new FirebaseService(configService);

    await expect(service.verifyIdToken('token')).resolves.toEqual({
      uid: 'user-1',
    });
    expect(firebaseMock.authMocks.verifyIdToken).toHaveBeenCalledWith('token');
  });

  it('gets a user by email', async () => {
    firebaseMock.authMocks.getUserByEmail.mockResolvedValue({ uid: 'user-2' });
    const service = new FirebaseService(configService);

    await expect(service.getUserByEmail('user@example.com')).resolves.toEqual({
      uid: 'user-2',
    });
    expect(firebaseMock.authMocks.getUserByEmail).toHaveBeenCalledWith(
      'user@example.com',
    );
  });
});
