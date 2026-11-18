import {
  as,
  createEvent,
  createVehicle,
  eventPayload,
  shareVehicle,
  type VehicleBody,
} from './support/api';
import {
  createTestApp,
  UNKNOWN_ID,
  USERS,
  type TestApp,
} from './support/test-app';

const { owner, guest, stranger } = USERS;

describe('Events (e2e)', () => {
  let t: TestApp;
  let vehicle: VehicleBody;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await t.close();
  });

  beforeEach(async () => {
    await t.clearDatabase();
    vehicle = await createVehicle(t, owner.uid);
  });

  describe('POST /events', () => {
    it('creates an event for the authenticated user', async () => {
      const payload = eventPayload(vehicle._id, { comment: 'Fragile' });

      const res = await as(t, owner.uid)
        .post('/events')
        .send(payload)
        .expect(201);

      expect(res.body).toMatchObject({ ...payload, userId: owner.uid });
    });

    it('defaults the comment to an empty string', async () => {
      const res = await as(t, owner.uid)
        .post('/events')
        .send(eventPayload(vehicle._id))
        .expect(201);

      expect(res.body.comment).toBe('');
    });

    it('lets a user with shared access create events', async () => {
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);

      const res = await as(t, guest.uid)
        .post('/events')
        .send(eventPayload(vehicle._id))
        .expect(201);

      expect(res.body.userId).toBe(guest.uid);
    });

    it('returns 404 when the vehicle is not accessible to the user', async () => {
      await as(t, stranger.uid)
        .post('/events')
        .send(eventPayload(vehicle._id))
        .expect(404);
    });

    it('returns 404 when the vehicle does not exist', async () => {
      await as(t, owner.uid)
        .post('/events')
        .send(eventPayload(UNKNOWN_ID))
        .expect(404);
    });

    describe('validation', () => {
      it.each([
        ['a missing title', { title: undefined }],
        ['an empty title', { title: '' }],
        ['a title longer than 200 characters', { title: 'x'.repeat(201) }],
        [
          'a comment longer than 2000 characters',
          { comment: 'x'.repeat(2001) },
        ],
        ['a date in the wrong format', { date: '01/12/2026' }],
        ['a date that does not exist', { date: '2026-02-30' }],
        ['a start time out of range', { hourStart: '24:00' }],
        ['an end time in the wrong format', { hourEnd: '9:5' }],
        ['an invalid vehicleId', { vehicleId: 'not-an-id' }],
        ['an unknown property', { extra: true }],
        ['a client-supplied userId', { userId: 'someone-else' }],
      ])('returns 400 for %s', async (_label, overrides) => {
        await as(t, owner.uid)
          .post('/events')
          .send(eventPayload(vehicle._id, overrides))
          .expect(400);
      });

      it.each([
        ['an end time equal to the start time', '10:00', '10:00'],
        ['an end time before the start time', '10:00', '09:00'],
      ])('returns 400 for %s', async (_label, hourStart, hourEnd) => {
        const res = await as(t, owner.uid)
          .post('/events')
          .send(eventPayload(vehicle._id, { hourStart, hourEnd }))
          .expect(400);

        expect(res.body).toMatchObject({
          message: 'The end time must be after the start time',
        });
      });
    });

    describe('overlap', () => {
      beforeEach(async () => {
        await createEvent(t, owner.uid, vehicle._id, {
          hourStart: '10:00',
          hourEnd: '12:00',
        });
      });

      it.each([
        ['the same range', '10:00', '12:00'],
        ['a range inside the existing one', '10:30', '11:30'],
        ['a range containing the existing one', '09:00', '13:00'],
        ['a range overlapping the start', '09:00', '10:30'],
        ['a range overlapping the end', '11:30', '13:00'],
      ])('returns 409 for %s', async (_label, hourStart, hourEnd) => {
        const res = await as(t, owner.uid)
          .post('/events')
          .send(eventPayload(vehicle._id, { hourStart, hourEnd }))
          .expect(409);

        expect(res.body).toMatchObject({
          message: 'The vehicle already has an event in that time range',
        });
      });

      it.each([
        ['starts exactly when the other ends', '12:00', '13:00'],
        ['ends exactly when the other starts', '09:00', '10:00'],
      ])('allows an event that %s', async (_label, hourStart, hourEnd) => {
        await as(t, owner.uid)
          .post('/events')
          .send(eventPayload(vehicle._id, { hourStart, hourEnd }))
          .expect(201);
      });

      it('allows the same time range on another date', async () => {
        await as(t, owner.uid)
          .post('/events')
          .send(
            eventPayload(vehicle._id, {
              date: '2026-12-02',
              hourStart: '10:00',
              hourEnd: '12:00',
            }),
          )
          .expect(201);
      });

      it('allows the same time range on another vehicle', async () => {
        const other = await createVehicle(t, owner.uid);

        await as(t, owner.uid)
          .post('/events')
          .send(
            eventPayload(other._id, { hourStart: '10:00', hourEnd: '12:00' }),
          )
          .expect(201);
      });
    });
  });

  describe('GET /events', () => {
    it('lists only events of vehicles the user can access', async () => {
      const mine = await createEvent(t, owner.uid, vehicle._id);
      const foreignVehicle = await createVehicle(t, stranger.uid);
      await createEvent(t, stranger.uid, foreignVehicle._id);

      const res = await as(t, owner.uid).get('/events').expect(200);

      expect(res.body.map((e: { _id: string }) => e._id)).toEqual([mine._id]);
    });

    it('includes events of vehicles shared with the user', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id);
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);

      const res = await as(t, guest.uid).get('/events').expect(200);

      expect(res.body.map((e: { _id: string }) => e._id)).toEqual([event._id]);
    });

    it('stops listing events once the access is revoked', async () => {
      await createEvent(t, owner.uid, vehicle._id);
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);
      await as(t, owner.uid)
        .delete(`/vehicles/${vehicle._id}/users/${guest.uid}`)
        .expect(200);

      const res = await as(t, guest.uid).get('/events').expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /events/:id', () => {
    it('returns the event to a user with access', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id);

      const res = await as(t, owner.uid)
        .get(`/events/${event._id}`)
        .expect(200);

      expect(res.body._id).toBe(event._id);
    });

    it('returns 404 to a user without access', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id);

      await as(t, stranger.uid).get(`/events/${event._id}`).expect(404);
    });

    it('returns 404 for an unknown event', async () => {
      await as(t, owner.uid).get(`/events/${UNKNOWN_ID}`).expect(404);
    });

    it('returns 400 for an invalid id', async () => {
      await as(t, owner.uid).get('/events/not-an-id').expect(400);
    });
  });

  describe('PUT /events/:id', () => {
    it('updates the event', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id);

      const res = await as(t, owner.uid)
        .put(`/events/${event._id}`)
        .send({ title: 'Updated', comment: 'New comment' })
        .expect(200);

      expect(res.body).toMatchObject({
        title: 'Updated',
        comment: 'New comment',
      });
    });

    it('lets a user with shared access update the event', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id);
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);

      await as(t, guest.uid)
        .put(`/events/${event._id}`)
        .send({ title: 'Edited by guest' })
        .expect(200);
    });

    it('does not count the event itself as an overlap', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id, {
        hourStart: '10:00',
        hourEnd: '11:00',
      });

      await as(t, owner.uid)
        .put(`/events/${event._id}`)
        .send({ hourEnd: '11:30' })
        .expect(200);
    });

    it('returns 409 when the new schedule overlaps another event', async () => {
      await createEvent(t, owner.uid, vehicle._id, {
        hourStart: '10:00',
        hourEnd: '11:00',
      });
      const second = await createEvent(t, owner.uid, vehicle._id, {
        hourStart: '11:00',
        hourEnd: '12:00',
      });

      await as(t, owner.uid)
        .put(`/events/${second._id}`)
        .send({ hourStart: '10:30' })
        .expect(409);
    });

    it('validates the merged time range using the stored values', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id, {
        hourStart: '10:00',
        hourEnd: '11:00',
      });

      await as(t, owner.uid)
        .put(`/events/${event._id}`)
        .send({ hourEnd: '09:00' })
        .expect(400);
    });

    it('moves the event to another accessible vehicle', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id);
      const other = await createVehicle(t, owner.uid);

      const res = await as(t, owner.uid)
        .put(`/events/${event._id}`)
        .send({ vehicleId: other._id })
        .expect(200);

      expect(res.body.vehicleId).toBe(other._id);
    });

    it('returns 409 when the target vehicle is busy at that time', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id);
      const other = await createVehicle(t, owner.uid);
      await createEvent(t, owner.uid, other._id);

      await as(t, owner.uid)
        .put(`/events/${event._id}`)
        .send({ vehicleId: other._id })
        .expect(409);
    });

    it('returns 404 when moving to a vehicle the user cannot access', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id);
      const foreign = await createVehicle(t, stranger.uid);

      await as(t, owner.uid)
        .put(`/events/${event._id}`)
        .send({ vehicleId: foreign._id })
        .expect(404);
    });

    it('returns 404 to a user without access to the event', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id);

      await as(t, stranger.uid)
        .put(`/events/${event._id}`)
        .send({ title: 'Hijacked' })
        .expect(404);
    });

    it('returns 404 for an unknown event', async () => {
      await as(t, owner.uid)
        .put(`/events/${UNKNOWN_ID}`)
        .send({ title: 'x' })
        .expect(404);
    });

    it('returns 400 for invalid data', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id);

      await as(t, owner.uid)
        .put(`/events/${event._id}`)
        .send({ date: 'tomorrow' })
        .expect(400);
    });
  });

  describe('DELETE /events/:id', () => {
    it('deletes the event', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id);

      const res = await as(t, owner.uid)
        .delete(`/events/${event._id}`)
        .expect(200);

      expect(res.body).toEqual({ message: 'Event deleted successfully' });
      await as(t, owner.uid).get(`/events/${event._id}`).expect(404);
    });

    it('lets a user with shared access delete the event', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id);
      await shareVehicle(t, vehicle._id, owner.uid, guest.email);

      await as(t, guest.uid).delete(`/events/${event._id}`).expect(200);
    });

    it('returns 404 to a user without access and keeps the event', async () => {
      const event = await createEvent(t, owner.uid, vehicle._id);

      await as(t, stranger.uid).delete(`/events/${event._id}`).expect(404);
      await as(t, owner.uid).get(`/events/${event._id}`).expect(200);
    });

    it('returns 404 for an unknown event', async () => {
      await as(t, owner.uid).delete(`/events/${UNKNOWN_ID}`).expect(404);
    });
  });
});
