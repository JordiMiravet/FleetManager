import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Connection } from 'mongoose';
import type { App } from 'supertest/types';
import { FirebaseService } from '../../src/auth/firebase/firebase.service';
import { validationPipeOptions } from '../../src/common/validation-pipe-options';
import { FakeFirebaseService, type FakeUser } from './fake-firebase.service';

export const USERS = {
  owner: { uid: 'owner-uid', email: 'owner@example.com' },
  guest: { uid: 'guest-uid', email: 'guest@example.com' },
  stranger: { uid: 'stranger-uid', email: 'stranger@example.com' },
} satisfies Record<string, FakeUser>;

/** A valid Mongo id that does not match any document. */
export const UNKNOWN_ID = '64b7f0c2a1b2c3d4e5f60718';

export interface TestApp {
  app: INestApplication<App>;
  http: App;
  firebase: FakeFirebaseService;
  clearDatabase(): Promise<void>;
  close(): Promise<void>;
}

/**
 * Boots the real AppModule against an in-memory MongoDB, replacing only
 * FirebaseService. Environment variables are set before AppModule is imported
 * because ConfigModule validates them when the module file is loaded.
 */
export async function createTestApp(): Promise<TestApp> {
  const mongod = await MongoMemoryServer.create();

  // process.env takes precedence over a local .env file.
  process.env.MONGO_URI = mongod.getUri('fleetmanager-e2e');
  process.env.FIREBASE_PROJECT_ID = 'test-project';
  process.env.FIREBASE_CLIENT_EMAIL = 'test@example.com';
  process.env.FIREBASE_PRIVATE_KEY = 'test-private-key';

  const { AppModule } = await import('../../src/app.module');

  const firebase = new FakeFirebaseService();
  Object.values(USERS).forEach((user) => firebase.registerUser(user));

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(FirebaseService)
    .useValue(firebase)
    .compile();

  const app = moduleRef.createNestApplication<INestApplication<App>>();
  // Same global validation as main.ts.
  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
  await app.init();

  const connection = app.get<Connection>(getConnectionToken());
  // Make sure unique indexes (e.g. vehicle plate) exist before the first test.
  await Promise.all(Object.values(connection.models).map((m) => m.init()));

  return {
    app,
    http: app.getHttpServer(),
    firebase,
    async clearDatabase() {
      await Promise.all(
        Object.values(connection.collections).map((c) => c.deleteMany({})),
      );
    },
    async close() {
      await app.close();
      await mongod.stop();
    },
  };
}
