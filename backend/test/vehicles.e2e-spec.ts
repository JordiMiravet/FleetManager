import {
  as,
  createEvent,
  createVehicle,
  shareVehicle,
  vehiclePayload,
} from './support/api';
import {
  createTestApp,
  UNKNOWN_ID,
  USERS,
  type TestApp,
} from './support/test-app';

const { owner, guest, stranger } = USERS;

describe('Vehicles (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await t.close();
  });

  beforeEach(async () => {
    await t.clearDatabase();
  });

  describe('POST /vehicles', () => {
    it('creates a vehicle owned by the authenticated user', async () => {
      const payload = vehiclePayload({ imageUrl: 'https://example.com/a.png' });

      const res = await as(t, owner.uid)
        .post('/vehicles')
        .send(payload)
        .expect(201);

      expect(res.body).toMatchObject({
        ...payload,
        userId: owner.uid,
        users: [],
      });
      expect(res.body._id).toEqual(expect.any(String));
    });

    it.each([
      ['a missing name', { name: undefined }],
      ['an empty plate', { plate: '' }],
      ['a plate longer than 20 characters', { plate: 'X'.repeat(21) }],
      ['a missing location', { location: undefined }],
      ['a latitude above 90', { location: { lat: 91, lng: 0 } }],
      ['a non-numeric longitude', { location: { lat: 0, lng: 'east' } }],
      ['an unknown property', { extra: true }],
      ['a client-supplied userId', { userId: 'someone-else' }],
    ])('returns 400 for %s', async (_label, overrides) => {
      await as(t, owner.uid)
        .post('/vehicles')
        .send(vehiclePayload(overrides))
        .expect(400);
    });

    it('accepts longitudes beyond +-180 (the map wraps around)', async () => {
      await as(t, owner.uid)
        .post('/vehicles')
        .send(vehiclePayload({ location: { lat: 10, lng: 200 } }))
        .expect(201);
    });

    // Currently a duplicated plate is not handled and surfaces as a 500.
    it.todo('returns 409 when the plate already exists');
  });

  describe('GET /vehicles', () => {
    it('lists only the vehicles the user owns or has been given access to', async () => {
      const owned = await createVehicle(t, owner.uid);
      const shared = await createVehicle(t, stranger.uid);
      await createVehicle(t, stranger.uid);
      await shareVehicle(t, shared._id, stranger.uid, owner.email);

      const res = await as(t, owner.uid).get('/vehicles').expect(200);

      expect(res.body.map((v: { _id: string }) => v._id).sort()).toEqual(
        [owned._id, shared._id].sort(),
      );
    });

    it('returns an empty list when the user has no vehicles', async () => {
      await createVehicle(t, owner.uid);

      const res = await as(t, guest.uid).get('/vehicles').expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /vehicles/:id', () => {
    it('returns the vehicle to its owner and to a shared user', async () => {
      const vehicle = await createVehicle(t, owner.uid);
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);

      for (const user of [owner, guest]) {
        const res = await as(t, user.uid)
          .get(`/vehicles/${vehicle._id}`)
          .expect(200);
        expect(res.body._id).toBe(vehicle._id);
      }
    });

    it('returns 404 when the user has no access to the vehicle', async () => {
      const vehicle = await createVehicle(t, owner.uid);

      await as(t, stranger.uid).get(`/vehicles/${vehicle._id}`).expect(404);
    });

    it('returns 400 for an invalid id', async () => {
      const res = await as(t, owner.uid).get('/vehicles/not-an-id').expect(400);

      expect(res.body).toMatchObject({ message: 'The id is not valid' });
    });
  });

  describe('PUT /vehicles/:id', () => {
    it('lets the owner edit every field', async () => {
      const vehicle = await createVehicle(t, owner.uid);

      const res = await as(t, owner.uid)
        .put(`/vehicles/${vehicle._id}`)
        .send({ name: 'Renamed', location: { lat: 1, lng: 2 } })
        .expect(200);

      expect(res.body).toMatchObject({
        name: 'Renamed',
        location: { lat: 1, lng: 2 },
      });
    });

    it('lets a shared user change only the location', async () => {
      const vehicle = await createVehicle(t, owner.uid, { name: 'Van' });
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);

      const res = await as(t, guest.uid)
        .put(`/vehicles/${vehicle._id}`)
        .send({ name: 'Van', location: { lat: 5, lng: 6 } })
        .expect(200);

      expect(res.body).toMatchObject({
        name: 'Van',
        location: { lat: 5, lng: 6 },
      });
    });

    it('returns 403 when a shared user edits an owner-only field', async () => {
      const vehicle = await createVehicle(t, owner.uid, { name: 'Van' });
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);

      const res = await as(t, guest.uid)
        .put(`/vehicles/${vehicle._id}`)
        .send({ name: 'Hijacked' })
        .expect(403);

      expect(res.body).toMatchObject({
        message: 'Only the owner can edit the vehicle details',
      });

      const unchanged = await as(t, owner.uid).get(`/vehicles/${vehicle._id}`);
      expect(unchanged.body.name).toBe('Van');
    });

    it('returns 404 when the user has no access to the vehicle', async () => {
      const vehicle = await createVehicle(t, owner.uid, { name: 'Van' });

      const res = await as(t, stranger.uid)
        .put(`/vehicles/${vehicle._id}`)
        .send({ name: 'Hijacked' })
        .expect(404);

      expect(res.body).toMatchObject({
        message: 'Vehicle not found',
      });

      const unchanged = await as(t, owner.uid).get(`/vehicles/${vehicle._id}`);
      expect(unchanged.body.name).toBe('Van');
    });

    it('returns 400 for invalid data', async () => {
      const vehicle = await createVehicle(t, owner.uid);

      await as(t, owner.uid)
        .put(`/vehicles/${vehicle._id}`)
        .send({ location: { lat: 100, lng: 0 } })
        .expect(400);
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('deletes the vehicle and its events when the owner requests it', async () => {
      const vehicle = await createVehicle(t, owner.uid);
      const event = await createEvent(t, owner.uid, vehicle._id);

      const res = await as(t, owner.uid)
        .delete(`/vehicles/${vehicle._id}`)
        .expect(200);

      expect(res.body._id).toBe(vehicle._id);
      await as(t, owner.uid).get(`/vehicles/${vehicle._id}`).expect(404);
      await as(t, owner.uid).get(`/events/${event._id}`).expect(404);
    });

    it('returns 403 when a shared user tries to delete the vehicle', async () => {
      const vehicle = await createVehicle(t, owner.uid);
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);

      const res = await as(t, guest.uid)
        .delete(`/vehicles/${vehicle._id}`)
        .expect(403);

      expect(res.body).toMatchObject({
        message: 'Only the owner can delete the vehicle',
      });

      await as(t, owner.uid).get(`/vehicles/${vehicle._id}`).expect(200);
    });
  });

  describe('POST /vehicles/:id/users', () => {
    it('lets the owner share the vehicle by email', async () => {
      const vehicle = await createVehicle(t, owner.uid);

      const res = await as(t, owner.uid)
        .post(`/vehicles/${vehicle._id}/users`)
        .send({ email: ` ${guest.email} ` })
        .expect(201);

      expect(res.body).toEqual({
        message: 'User added successfully',
        userId: guest.uid,
        email: guest.email,
      });
      await as(t, guest.uid).get(`/vehicles/${vehicle._id}`).expect(200);
    });

    it('returns 403 when a shared user tries to share the vehicle', async () => {
      const vehicle = await createVehicle(t, owner.uid);
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);

      const res = await as(t, guest.uid)
        .post(`/vehicles/${vehicle._id}/users`)
        .send({ email: stranger.email })
        .expect(403);

      expect(res.body).toMatchObject({
        message: 'Only the owner can share the vehicle',
      });
    });

    it('returns 404 when the user has no access to the vehicle', async () => {
      const vehicle = await createVehicle(t, owner.uid);

      await as(t, stranger.uid)
        .post(`/vehicles/${vehicle._id}/users`)
        .send({ email: guest.email })
        .expect(404);
    });

    it('returns 404 when no user exists with that email', async () => {
      const vehicle = await createVehicle(t, owner.uid);

      const res = await as(t, owner.uid)
        .post(`/vehicles/${vehicle._id}/users`)
        .send({ email: 'nobody@example.com' })
        .expect(404);

      expect(res.body).toMatchObject({
        message: 'User not found with this email',
      });
    });

    it('returns 400 when the owner adds themself', async () => {
      const vehicle = await createVehicle(t, owner.uid);

      const res = await as(t, owner.uid)
        .post(`/vehicles/${vehicle._id}/users`)
        .send({ email: owner.email })
        .expect(400);

      expect(res.body).toMatchObject({ message: 'You cannot add yourself' });
    });

    it('returns 400 when the user already has access', async () => {
      const vehicle = await createVehicle(t, owner.uid);
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);

      const res = await as(t, owner.uid)
        .post(`/vehicles/${vehicle._id}/users`)
        .send({ email: guest.email })
        .expect(400);

      expect(res.body).toMatchObject({
        message: 'User already has access to this vehicle',
      });
    });

    it.each([
      ['an invalid email', { email: 'not-an-email' }],
      ['a missing email', {}],
      ['an unknown property', { email: 'a@b.com', role: 'admin' }],
    ])('returns 400 for %s', async (_label, body) => {
      const vehicle = await createVehicle(t, owner.uid);

      await as(t, owner.uid)
        .post(`/vehicles/${vehicle._id}/users`)
        .send(body)
        .expect(400);
    });
  });

  describe('DELETE /vehicles/:id/users/:userId', () => {
    it('lets the owner remove a shared user', async () => {
      const vehicle = await createVehicle(t, owner.uid);
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);

      const res = await as(t, owner.uid)
        .delete(`/vehicles/${vehicle._id}/users/${guest.uid}`)
        .expect(200);

      expect(res.body).toEqual({ message: 'User removed successfully' });
      await as(t, guest.uid).get(`/vehicles/${vehicle._id}`).expect(404);
    });

    it('lets a shared user remove themself', async () => {
      const vehicle = await createVehicle(t, owner.uid);
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);

      await as(t, guest.uid)
        .delete(`/vehicles/${vehicle._id}/users/${guest.uid}`)
        .expect(200);

      await as(t, guest.uid).get(`/vehicles/${vehicle._id}`).expect(404);
    });

    it('returns 403 when a shared user removes someone else', async () => {
      const vehicle = await createVehicle(t, owner.uid);
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);

      const res = await as(t, guest.uid)
        .delete(`/vehicles/${vehicle._id}/users/${owner.uid}`)
        .expect(403);

      expect(res.body).toMatchObject({
        message: 'You can only remove yourself or be the vehicle owner',
      });
    });

    it('returns 404 when the user has no access to the vehicle', async () => {
      const vehicle = await createVehicle(t, owner.uid);

      await as(t, stranger.uid)
        .delete(`/vehicles/${vehicle._id}/users/${guest.uid}`)
        .expect(404);
    });

    it('returns 404 for a vehicle that does not exist', async () => {
      await as(t, owner.uid)
        .delete(`/vehicles/${UNKNOWN_ID}/users/${guest.uid}`)
        .expect(404);
    });
  });
});
