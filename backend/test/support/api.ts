import request from 'supertest';
import { bearer } from './fake-firebase.service';
import type { TestApp } from './test-app';

type Req = request.Test;

/** Thin wrapper over supertest that sends the token of the given user. */
export function as(t: TestApp, uid: string) {
  const withAuth = (req: Req): Req => req.set('Authorization', bearer(uid));

  return {
    get: (url: string) => withAuth(request(t.http).get(url)),
    post: (url: string) => withAuth(request(t.http).post(url)),
    put: (url: string) => withAuth(request(t.http).put(url)),
    delete: (url: string) => withAuth(request(t.http).delete(url)),
  };
}

let plateCounter = 0;

export function vehiclePayload(overrides: Record<string, unknown> = {}) {
  plateCounter += 1;

  return {
    name: 'Van',
    model: 'Transit',
    plate: `PLATE-${plateCounter}`,
    location: { lat: 41.4, lng: 2.2 },
    ...overrides,
  };
}

export function eventPayload(
  vehicleId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    title: 'Delivery',
    date: '2026-12-01',
    hourStart: '10:00',
    hourEnd: '11:00',
    vehicleId,
    ...overrides,
  };
}

export interface VehicleBody {
  _id: string;
  userId: string;
  [key: string]: unknown;
}

export interface EventBody {
  _id: string;
  vehicleId: string;
  userId: string;
  [key: string]: unknown;
}

export async function createVehicle(
  t: TestApp,
  uid: string,
  overrides: Record<string, unknown> = {},
): Promise<VehicleBody> {
  const res = await as(t, uid)
    .post('/vehicles')
    .send(vehiclePayload(overrides))
    .expect(201);

  return res.body as VehicleBody;
}

export async function shareVehicle(
  t: TestApp,
  vehicleId: string,
  ownerUid: string,
  email: string,
): Promise<void> {
  await as(t, ownerUid)
    .post(`/vehicles/${vehicleId}/users`)
    .send({ email })
    .expect(201);
}

export async function createEvent(
  t: TestApp,
  uid: string,
  vehicleId: string,
  overrides: Record<string, unknown> = {},
): Promise<EventBody> {
  const res = await as(t, uid)
    .post('/events')
    .send(eventPayload(vehicleId, overrides))
    .expect(201);

  return res.body as EventBody;
}
