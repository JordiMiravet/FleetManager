import { RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { buildCreateVehicleDto } from '../common/testing/builders';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { VehicleSharingService } from './vehicle-sharing.service';

jest.mock('./vehicle-sharing.service', () => ({
  VehicleSharingService: class VehicleSharingService {},
}));

jest.mock('../auth/firebase-auth.guard', () => ({
  FirebaseAuthGuard: class FirebaseAuthGuard {},
}));

const ROUTES: [keyof VehicleController, RequestMethod, string][] = [
  ['getAll', RequestMethod.GET, '/'],
  ['getOne', RequestMethod.GET, ':id'],
  ['create', RequestMethod.POST, '/'],
  ['update', RequestMethod.PUT, ':id'],
  ['delete', RequestMethod.DELETE, ':id'],
  ['addUserByEmail', RequestMethod.POST, ':id/users'],
  ['removeUser', RequestMethod.DELETE, ':id/users/:userId'],
];

describe('VehicleController', () => {
  const failure = new Error('Service failure');

  const vehicleService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const sharingService = {
    addUserByEmail: jest.fn(),
    removeUser: jest.fn(),
  };

  let controller: VehicleController;

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        { provide: VehicleService, useValue: vehicleService },
        { provide: VehicleSharingService, useValue: sharingService },
      ],
    }).compile();

    controller = moduleRef.get(VehicleController);
  });

  describe('routing', () => {
    it('is mounted under the vehicles path', () => {
      expect(Reflect.getMetadata(PATH_METADATA, VehicleController)).toBe(
        'vehicles',
      );
    });

    it('is protected with FirebaseAuthGuard', () => {
      expect(Reflect.getMetadata(GUARDS_METADATA, VehicleController)).toEqual([
        FirebaseAuthGuard,
      ]);
    });

    it.each(ROUTES)(
      'exposes %s with the method %s on the path "%s"',
      (name, method, path) => {
        const handler = VehicleController.prototype[name] as object;

        expect(Reflect.getMetadata(METHOD_METADATA, handler)).toBe(method);
        expect(Reflect.getMetadata(PATH_METADATA, handler)).toBe(path);
      },
    );
  });

  describe('getAll', () => {
    it('returns the vehicles of the user', async () => {
      const vehicles = [{ id: 'vehicle-1' }];
      vehicleService.findAll.mockResolvedValue(vehicles);

      await expect(controller.getAll('user-1')).resolves.toBe(vehicles);
      expect(vehicleService.findAll).toHaveBeenCalledWith('user-1');
    });

    it('propagates the error of the service', async () => {
      vehicleService.findAll.mockRejectedValue(failure);

      await expect(controller.getAll('user-1')).rejects.toBe(failure);
    });
  });

  describe('getOne', () => {
    it('returns a vehicle of the user', async () => {
      const vehicle = { id: 'vehicle-1' };
      vehicleService.findOne.mockResolvedValue(vehicle);

      await expect(controller.getOne('vehicle-1', 'user-1')).resolves.toBe(
        vehicle,
      );
      expect(vehicleService.findOne).toHaveBeenCalledWith(
        'vehicle-1',
        'user-1',
      );
    });

    it('propagates the error of the service', async () => {
      vehicleService.findOne.mockRejectedValue(failure);

      await expect(controller.getOne('vehicle-1', 'user-1')).rejects.toBe(
        failure,
      );
    });
  });

  describe('create', () => {
    const dto = buildCreateVehicleDto();

    it('creates a vehicle for the user', async () => {
      const vehicle = { id: 'vehicle-1', ...dto };
      vehicleService.create.mockResolvedValue(vehicle);

      await expect(controller.create(dto, 'user-1')).resolves.toBe(vehicle);
      expect(vehicleService.create).toHaveBeenCalledWith(dto, 'user-1');
    });

    it('propagates the error of the service', async () => {
      vehicleService.create.mockRejectedValue(failure);

      await expect(controller.create(dto, 'user-1')).rejects.toBe(failure);
    });
  });

  describe('update', () => {
    const dto = { model: 'Yaris' };

    it('updates a vehicle of the user', async () => {
      const vehicle = { id: 'vehicle-1', ...dto };
      vehicleService.update.mockResolvedValue(vehicle);

      await expect(controller.update('vehicle-1', dto, 'user-1')).resolves.toBe(
        vehicle,
      );
      expect(vehicleService.update).toHaveBeenCalledWith(
        'vehicle-1',
        dto,
        'user-1',
      );
    });

    it('propagates the error of the service', async () => {
      vehicleService.update.mockRejectedValue(failure);

      await expect(controller.update('vehicle-1', dto, 'user-1')).rejects.toBe(
        failure,
      );
    });
  });

  describe('delete', () => {
    it('deletes a vehicle of the user', async () => {
      const vehicle = { id: 'vehicle-1' };
      vehicleService.delete.mockResolvedValue(vehicle);

      await expect(controller.delete('vehicle-1', 'user-1')).resolves.toBe(
        vehicle,
      );
      expect(vehicleService.delete).toHaveBeenCalledWith('vehicle-1', 'user-1');
    });

    it('propagates the error of the service', async () => {
      vehicleService.delete.mockRejectedValue(failure);

      await expect(controller.delete('vehicle-1', 'user-1')).rejects.toBe(
        failure,
      );
    });
  });

  describe('addUserByEmail', () => {
    const body = { email: 'user@example.com' };

    it('shares the vehicle with the user of that email', async () => {
      const result = { message: 'User added successfully' };
      sharingService.addUserByEmail.mockResolvedValue(result);

      await expect(
        controller.addUserByEmail('vehicle-1', body, 'owner-1'),
      ).resolves.toBe(result);
      expect(sharingService.addUserByEmail).toHaveBeenCalledWith(
        'vehicle-1',
        'user@example.com',
        'owner-1',
      );
    });

    it('propagates the error of the service', async () => {
      sharingService.addUserByEmail.mockRejectedValue(failure);

      await expect(
        controller.addUserByEmail('vehicle-1', body, 'owner-1'),
      ).rejects.toBe(failure);
    });
  });

  describe('removeUser', () => {
    it('removes the user from the vehicle', async () => {
      const result = { message: 'User removed successfully' };
      sharingService.removeUser.mockResolvedValue(result);

      await expect(
        controller.removeUser('vehicle-1', 'user-2', 'owner-1'),
      ).resolves.toBe(result);
      expect(sharingService.removeUser).toHaveBeenCalledWith(
        'vehicle-1',
        'user-2',
        'owner-1',
      );
    });

    it('propagates the error of the service', async () => {
      sharingService.removeUser.mockRejectedValue(failure);

      await expect(
        controller.removeUser('vehicle-1', 'user-2', 'owner-1'),
      ).rejects.toBe(failure);
    });
  });
});
