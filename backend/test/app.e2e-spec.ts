import request from 'supertest';
import { createTestApp, type TestApp } from './support/test-app';

describe('App (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await t.close();
  });

  it('GET /check-db reports the database connection state', () => {
    return request(t.http).get('/check-db').expect(200).expect('Connected');
  });

  it('returns 404 for an unknown route', () => {
    return request(t.http).get('/does-not-exist').expect(404);
  });
});
