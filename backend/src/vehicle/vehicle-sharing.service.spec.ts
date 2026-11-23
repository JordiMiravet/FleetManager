import { HttpStatus } from '@nestjs/common';
import { FirebaseService } from '../auth/firebase/firebase.service';
import { buildVehicle } from '../common/testing/builders';
import { expectHttpError } from '../common/testing/expect-http-error';
import { VehicleAccessService } from './access/vehicle-access.service';
import { VehicleService } from './vehicle.service';
import { VehicleSharingService } from './vehicle-sharing.service';

// @nestjs/config is an ES module that Jest cannot load in this CommonJS setup.
jest.mock('../auth/firebase/firebase.service', () => ({
  FirebaseService: class FirebaseService {},
}));

const NOT_FOUND = 'Vehicle not found';

describe('VehicleSharingService', () => {
  const vehicle = buildVehicle();

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
    const add = (email = 'user@example.com', userId = 'owner-1') =>
      service.addUserByEmail('vehicle-1', email, userId);

    describe('as the owner', () => {
      beforeEach(() => {
        findAccessibleVehicle.mockResolvedValue(vehicle);
        getUserByEmail.mockResolvedValue({
          uid: 'user-2',
          email: 'user@example.com',
        });
      });

      it('adds the user and returns the result', async () => {
        addUserToVehicle.mockResolvedValue(undefined);

        await expect(add()).resolves.toEqual({
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

      it('rejects adding the owner themselves', async () => {
        getUserByEmail.mockResolvedValue({
          uid: 'owner-1',
          email: 'owner@example.com',
        });

        await expectHttpError(
          add('owner@example.com'),
          HttpStatus.BAD_REQUEST,
          'You cannot add yourself',
        );
        expect(addUserToVehicle).not.toHaveBeenCalled();
      });

      describe('looking up the email in Firebase', () => {
        it.each([
          ['an unknown email', 'auth/user-not-found', 'nobody@example.com'],
          ['an invalid email', 'auth/invalid-email', 'not-an-email'],
        ])('reports %s as not found', async (_label, code, email) => {
          getUserByEmail.mockRejectedValue(
            Object.assign(new Error('Firebase error'), { code }),
          );

          await expectHttpError(
            add(email),
            HttpStatus.NOT_FOUND,
            'User not found with this email',
          );
          expect(addUserToVehicle).not.toHaveBeenCalled();
        });

        it('does not hide unexpected errors', async () => {
          const error = new Error('network');
          getUserByEmail.mockRejectedValue(error);

          await expect(add()).rejects.toBe(error);
        });
      });

      it('does not hide unexpected persistence errors', async () => {
        const error = new Error('database');
        addUserToVehicle.mockRejectedValue(error);

        await expect(add()).rejects.toBe(error);
      });
    });

    describe('without being the owner', () => {
      it('rejects a vehicle the user cannot access', async () => {
        findAccessibleVehicle.mockResolvedValue(null);

        await expectHttpError(
          add(),
          HttpStatus.NOT_FOUND,
          'Vehicle not found or you are not the owner',
        );
        expect(getUserByEmail).not.toHaveBeenCalled();
      });

      it('rejects a shared user', async () => {
        findAccessibleVehicle.mockResolvedValue(vehicle);

        await expectHttpError(
          add('user@example.com', 'user-2'),
          HttpStatus.FORBIDDEN,
          'Only the owner can share the vehicle',
        );
        expect(getUserByEmail).not.toHaveBeenCalled();
        expect(addUserToVehicle).not.toHaveBeenCalled();
      });
    });
  });

  describe('removeUser', () => {
    const remove = (userIdToRemove: string, currentUserId: string) =>
      service.removeUser('vehicle-1', userIdToRemove, currentUserId);

    it('rejects a vehicle the user cannot access', async () => {
      findAccessibleVehicle.mockResolvedValue(null);

      await expectHttpError(
        remove('user-2', 'owner-1'),
        HttpStatus.NOT_FOUND,
        NOT_FOUND,
      );
      expect(removeUserFromVehicle).not.toHaveBeenCalled();
    });

    describe('with access to the vehicle', () => {
      beforeEach(() => {
        findAccessibleVehicle.mockResolvedValue(vehicle);
        removeUserFromVehicle.mockResolvedValue(undefined);
      });

      it('lets the owner remove another user', async () => {
        await expect(remove('user-2', 'owner-1')).resolves.toEqual({
          message: 'User removed successfully',
        });
        expect(removeUserFromVehicle).toHaveBeenCalledWith(
          'vehicle-1',
          'user-2',
        );
      });

      it('lets a shared user remove themselves', async () => {
        await expect(remove('user-2', 'user-2')).resolves.toEqual({
          message: 'User removed successfully',
        });
      });

      it('rejects a shared user who removes someone else', async () => {
        await expectHttpError(
          remove('user-3', 'user-2'),
          HttpStatus.FORBIDDEN,
          'You can only remove yourself or be the vehicle owner',
        );
        expect(removeUserFromVehicle).not.toHaveBeenCalled();
      });
    });
  });
});
