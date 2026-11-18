import request from 'supertest';
import { bearer } from './support/fake-firebase.service';
import {
  createTestApp,
  UNKNOWN_ID,
  USERS,
  type TestApp,
} from './support/test-app';

describe('Authentication (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await t.close();
  });

  describe('POST /auth/verify', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(t.http).post('/auth/verify').expect(401);

      expect(res.body).toMatchObject({ message: 'No token provided' });
    });

    it.each([
      ['a non-Bearer scheme', 'Basic abc'],
      ['a Bearer scheme without token', 'Bearer'],
    ])('returns 401 for %s', async (_label, header) => {
      const res = await request(t.http)
        .post('/auth/verify')
        .set('Authorization', header)
        .expect(401);

      expect(res.body).toMatchObject({ message: 'Invalid token' });
    });

    it('returns 401 when the token is rejected by Firebase', async () => {
      const res = await request(t.http)
        .post('/auth/verify')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);

      expect(res.body).toMatchObject({ message: 'Invalid token' });
    });

    it('returns the verified user for a valid token', async () => {
      const res = await request(t.http)
        .post('/auth/verify')
        .set('Authorization', bearer(USERS.owner.uid))
        .expect(201);

      expect(res.body).toEqual({
        message: 'User verified',
        user: { uid: USERS.owner.uid, email: USERS.owner.email },
      });
    });
  });

  describe('protected routes', () => {
    it.each([
      ['GET', '/vehicles'],
      ['GET', `/vehicles/${UNKNOWN_ID}`],
      ['POST', '/vehicles'],
      ['PUT', `/vehicles/${UNKNOWN_ID}`],
      ['DELETE', `/vehicles/${UNKNOWN_ID}`],
      ['POST', `/vehicles/${UNKNOWN_ID}/users`],
      ['DELETE', `/vehicles/${UNKNOWN_ID}/users/someone`],
      ['GET', '/events'],
      ['GET', `/events/${UNKNOWN_ID}`],
      ['POST', '/events'],
      ['PUT', `/events/${UNKNOWN_ID}`],
      ['DELETE', `/events/${UNKNOWN_ID}`],
    ])('%s %s requires authentication', async (method, url) => {
      const agent = request(t.http);
      const req = {
        GET: agent.get,
        POST: agent.post,
        PUT: agent.put,
        DELETE: agent.delete,
      }[method]!.call(agent, url);

      await req.expect(401);
    });
  });
});
