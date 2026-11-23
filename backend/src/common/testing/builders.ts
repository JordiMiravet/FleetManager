import type { CreateEventDto } from '../../events/dtos/create-event.dto';
import type { CreateVehicleDto } from '../../vehicle/dtos/create-vehicle.dto';

export interface VehicleFixture {
  _id: string;
  userId: string;
  name: string;
  model: string;
  plate: string;
  imageUrl?: string | null;
  location: { lat: number; lng: number };
  users: { userId: string; email: string }[];
}

export interface EventFixture {
  _id: string;
  userId: string;
  vehicleId: string;
  title: string;
  date: string;
  hourStart: string;
  hourEnd: string;
}

export const buildVehicle = (
  overrides: Partial<VehicleFixture> = {},
): VehicleFixture => ({
  _id: 'vehicle-1',
  userId: 'owner-1',
  name: 'Car',
  model: 'Porsche',
  plate: '1234-ABC',
  imageUrl: 'image.png',
  location: { lat: 1, lng: 2 },
  users: [],
  ...overrides,
});

export const buildEvent = (
  overrides: Partial<EventFixture> = {},
): EventFixture => ({
  _id: 'event-1',
  userId: 'user-2',
  vehicleId: 'vehicle-1',
  title: 'Trip',
  date: '2026-11-10',
  hourStart: '09:00',
  hourEnd: '10:00',
  ...overrides,
});

export const buildCreateEventDto = (
  overrides: Partial<CreateEventDto> = {},
): CreateEventDto => ({
  title: 'Trip',
  date: '2026-11-10',
  hourStart: '09:00',
  hourEnd: '10:00',
  vehicleId: 'vehicle-1',
  ...overrides,
});

export const buildCreateVehicleDto = (
  overrides: Partial<CreateVehicleDto> = {},
): CreateVehicleDto => ({
  name: 'Car',
  model: 'Porsche',
  plate: '1234-ABC',
  location: { lat: 41.3851, lng: 2.1734 },
  ...overrides,
});
