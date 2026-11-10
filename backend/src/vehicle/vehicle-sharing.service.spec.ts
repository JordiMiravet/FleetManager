import { HttpException, HttpStatus } from '@nestjs/common';
import { FirebaseService } from '../auth/firebase/firebase.service';
import { VehicleAccessService } from './access/vehicle-access.service';
import { VehicleService } from './vehicle.service';
import { VehicleSharingService } from './vehicle-sharing.service';

// The real service imports @nestjs/config, an ES module that Jest cannot load
// in this CommonJS setup. Only the class is needed here as an injection token.
jest.mock('../auth/firebase/firebase.service', () => ({
  FirebaseService: class FirebaseService {},
}));

async function expectHttpError(
  promise: Promise<unknown>,
  status: HttpStatus,
  message: string,
) {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  );

  expect(error).toBeInstanceOf(HttpException);
  expect((error as HttpException).getStatus()).toBe(status);
  expect((error as HttpException).message).toBe(message);
}

describe('VehicleSharingService', () => {
  const vehicle = { _id: 'vehicle-1', userId: 'owner-1', users: [] };

  let findAccessibleVehicle: jest.Mock;
  let addUserToVehicle: jest.Mock;
  let removeUserFromVehicle: jest.Mock;
  let getUserByEmail: jest.Mock;
  let service: VehicleSharingService;

  beforeEach(() => {
    findAccessibleVehicle = jest.fn();
    addUserToVehicle = jest.fn();
    removeUserFromVehicle = jest.fn();
    getUserByEmail = jest.fn();

    service = new VehicleSharingService(
      { addUserToVehicle, removeUserFromVehicle } as unknown as VehicleService,
      {
        findAccessibleVehicle,
        isOwner: (found: { userId: string }, userId: string) =>
          found.userId === userId,
      } as unknown as VehicleAccessService,
      { getUserByEmail } as unknown as FirebaseService,
    );
  });

  describe('addUserByEmail', () => {
    it('adds the user and returns the result', async () => {
      findAccessibleVehicle.mockResolvedValue(vehicle);
      getUserByEmail.mockResolvedValue({
        uid: 'user-2',
        email: 'user@example.com',
      });
      addUserToVehicle.mockResolvedValue(undefined);

      await expect(
        service.addUserByEmail('vehicle-1', 'user@example.com', 'owner-1'),
      ).resolves.toEqual({
        message: 'User added successfully',
        userId: 'user-2',
        email: 'user@example.com',
      });
      expect(addUserToVehicle).toHaveBeenCalledWith(
        'vehicle-1',
        'user-2',
        'user@example.com',
      );
    });

    it('rejects when the vehicle is not accessible', async () => {
      findAccessibleVehicle.mockResolvedValue(null);

      await expectHttpError(
        service.addUserByEmail('vehicle-1', 'user@example.com', 'owner-1'),
        HttpStatus.NOT_FOUND,
        'Vehicle not found or you are not the owner',
      );
      expect(getUserByEmail).not.toHaveBeenCalled();
    });

    it('reports an unknown email as not found', async () => {
      findAccessibleVehicle.mockResolvedValue(vehicle);
      getUserByEmail.mockRejectedValue(
        Object.assign(new Error('no user'), { code: 'auth/user-not-found' }),
      );

      await expectHttpError(
        service.addUserByEmail('vehicle-1', 'nobody@example.com', 'owner-1'),
        HttpStatus.NOT_FOUND,
        'User not found with this email',
      );
      expect(addUserToVehicle).not.toHaveBeenCalled();
    });

    it('reports an invalid email as not found', async () => {
      findAccessibleVehicle.mockResolvedValue(vehicle);
      getUserByEmail.mockRejectedValue(
        Object.assign(new Error('bad email'), { code: 'auth/invalid-email' }),
      );

      await expectHttpError(
        service.addUserByEmail('vehicle-1', 'not-an-email', 'owner-1'),
        HttpStatus.NOT_FOUND,
        'User not found with this email',
      );
    });

    it('does not hide unexpected Firebase errors', async () => {
      const error = new Error('network');
      findAccessibleVehicle.mockResolvedValue(vehicle);
      getUserByEmail.mockRejectedValue(error);

      await expect(
        service.addUserByEmail('vehicle-1', 'user@example.com', 'owner-1'),
      ).rejects.toBe(error);
    });

    it('rejects adding the owner themselves', async () => {
      findAccessibleVehicle.mockResolvedValue(vehicle);
      getUserByEmail.mockResolvedValue({
        uid: 'owner-1',
        email: 'owner@example.com',
      });

      await expectHttpError(
        service.addUserByEmail('vehicle-1', 'owner@example.com', 'owner-1'),
        HttpStatus.BAD_REQUEST,
        'You cannot add yourself',
      );
      expect(addUserToVehicle).not.toHaveBeenCalled();
    });

    it('does not hide unexpected persistence errors', async () => {
      const error = new Error('database');
      findAccessibleVehicle.mockResolvedValue(vehicle);
      getUserByEmail.mockResolvedValue({
        uid: 'user-2',
        email: 'user@example.com',
      });
      addUserToVehicle.mockRejectedValue(error);

      await expect(
        service.addUserByEmail('vehicle-1', 'user@example.com', 'owner-1'),
      ).rejects.toBe(error);
    });
  });

  describe('removeUser', () => {
    it('rejects when the vehicle is not accessible', async () => {
      findAccessibleVehicle.mockResolvedValue(null);

      await expectHttpError(
        service.removeUser('vehicle-1', 'user-2', 'owner-1'),
        HttpStatus.NOT_FOUND,
        'Vehicle not found',
      );
      expect(removeUserFromVehicle).not.toHaveBeenCalled();
    });

    it('lets the owner remove another user', async () => {
      findAccessibleVehicle.mockResolvedValue(vehicle);
      removeUserFromVehicle.mockResolvedValue(undefined);

      await expect(
        service.removeUser('vehicle-1', 'user-2', 'owner-1'),
      ).resolves.toEqual({ message: 'User removed successfully' });
      expect(removeUserFromVehicle).toHaveBeenCalledWith('vehicle-1', 'user-2');
    });

    it('lets a shared user remove themselves', async () => {
      findAccessibleVehicle.mockResolvedValue(vehicle);
      removeUserFromVehicle.mockResolvedValue(undefined);

      await expect(
        service.removeUser('vehicle-1', 'user-2', 'user-2'),
      ).resolves.toEqual({ message: 'User removed successfully' });
    });

    it('rejects removing someone else when not the owner', async () => {
      findAccessibleVehicle.mockResolvedValue(vehicle);

      await expectHttpError(
        service.removeUser('vehicle-1', 'user-3', 'user-2'),
        HttpStatus.FORBIDDEN,
        'You can only remove yourself or be the vehicle owner',
      );
      expect(removeUserFromVehicle).not.toHaveBeenCalled();
    });
  });
});
