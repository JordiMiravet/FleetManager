import { Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { EventsService } from '../events/events.service';
import { VehicleAccessService } from './access/vehicle-access.service';
import { VehicleDocument } from './schemas/vehicle.schema';
import { VehicleService } from './vehicle.service';

function resolvingQuery<T>(value: T) {
  return { exec: jest.fn().mockResolvedValue(value) };
}

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

describe('VehicleService', () => {
  let vehicleModelFindOneAndUpdate: jest.Mock;
  let vehicleModelFindOneAndDelete: jest.Mock;
  let vehicleModelExists: jest.Mock;
  let vehicleModelSave: jest.Mock;

  let vehicleAccessFindOne: jest.Mock;
  let vehicleAccessFindAll: jest.Mock;

  let eventsDeleteByVehicle: jest.Mock;

  let service: VehicleService;

  const MockVehicleModel = jest
    .fn()
    .mockImplementation((data: Record<string, unknown>) => ({
      ...data,
      save: vehicleModelSave,
    }));

  beforeEach(() => {
    vehicleModelFindOneAndUpdate = jest.fn();
    vehicleModelFindOneAndDelete = jest.fn();
    vehicleModelExists = jest.fn();
    vehicleModelSave = jest.fn();

    vehicleAccessFindOne = jest.fn();
    vehicleAccessFindAll = jest.fn();

    eventsDeleteByVehicle = jest.fn().mockResolvedValue(undefined);

    Object.assign(MockVehicleModel, {
      findOneAndUpdate: vehicleModelFindOneAndUpdate,
      findOneAndDelete: vehicleModelFindOneAndDelete,
      exists: vehicleModelExists,
    });

    service = new VehicleService(
      MockVehicleModel as unknown as Model<VehicleDocument>,
      {
        deleteByVehicle: eventsDeleteByVehicle,
      } as unknown as EventsService,
      {
        findAccessibleVehicle: vehicleAccessFindOne,
        findAccessibleVehicles: vehicleAccessFindAll,
        isOwner: (vehicle: { userId: string }, userId: string) =>
          vehicle.userId === userId,
        buildAccessFilter: (userId: string) => ({
          $or: [{ userId }, { 'users.userId': userId }],
        }),
      } as unknown as VehicleAccessService,
    );
  });

  describe('findAll', () => {
    it('returns all vehicles accessible by the user', async () => {
      const vehicles = [
        { _id: 'vehicle-1', name: 'Ferrari' },
        { _id: 'vehicle-2', name: 'Pagani' },
      ];

      vehicleAccessFindAll.mockResolvedValue(vehicles);

      await expect(service.findAll('user-1')).resolves.toBe(vehicles);

      expect(vehicleAccessFindAll).toHaveBeenCalledTimes(1);
      expect(vehicleAccessFindAll).toHaveBeenCalledWith('user-1');
    });

    it('returns an empty array when the user has no accessible vehicles', async () => {
      vehicleAccessFindAll.mockResolvedValue([]);

      await expect(service.findAll('user-1')).resolves.toEqual([]);

      expect(vehicleAccessFindAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findOne', () => {
    it('returns the accessible vehicle', async () => {
      const vehicle = {
        _id: 'vehicle-1',
        userId: 'owner-1',
        name: 'Ferrari',
      };

      vehicleAccessFindOne.mockResolvedValue(vehicle);

      await expect(service.findOne('vehicle-1', 'user-1')).resolves.toBe(
        vehicle,
      );

      expect(vehicleAccessFindOne).toHaveBeenCalledTimes(1);
      expect(vehicleAccessFindOne).toHaveBeenCalledWith('vehicle-1', 'user-1');
    });

    it('returns null when the vehicle is not accessible', async () => {
      vehicleAccessFindOne.mockResolvedValue(null);

      await expect(service.findOne('vehicle-1', 'user-1')).resolves.toBeNull();

      expect(vehicleAccessFindOne).toHaveBeenCalledWith('vehicle-1', 'user-1');
    });
  });

  describe('create', () => {
    it('creates a vehicle associated with the user', async () => {
      const vehicleDto: CreateVehicleDto = {
        name: 'Ferrari',
        model: 'f8',
        plate: '1234-ABC',
        location: {
          lat: 41.3851,
          lng: 2.1734,
        },
      };

      const savedVehicle = {
        ...vehicleDto,
        userId: 'user-1',
      };

      vehicleModelSave.mockResolvedValue(savedVehicle);

      await expect(service.create(vehicleDto, 'user-1')).resolves.toBe(
        savedVehicle,
      );

      expect(MockVehicleModel).toHaveBeenCalledWith({
        ...vehicleDto,
        userId: 'user-1',
      });

      expect(vehicleModelSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const vehicle = {
      _id: 'vehicle-1',
      userId: 'owner-1',
      name: 'Car',
      model: 'Porsche',
      plate: '1234-ABC',
      imageUrl: 'image.png',
    };

    const location = { lat: 1, lng: 2 };

    function accessFilterFor(userId: string) {
      return { $or: [{ userId }, { 'users.userId': userId }] };
    }

    beforeEach(() => {
      vehicleModelFindOneAndUpdate.mockReturnValue(
        resolvingQuery({ updated: true }),
      );
    });

    it('returns null without updating when the vehicle is not accessible', async () => {
      vehicleAccessFindOne.mockResolvedValue(null);

      await expect(
        service.update('vehicle-1', { name: 'New' }, 'stranger'),
      ).resolves.toBeNull();

      expect(vehicleModelFindOneAndUpdate).not.toHaveBeenCalled();
    });

    it('lets the owner update every field', async () => {
      vehicleAccessFindOne.mockResolvedValue(vehicle);

      await service.update(
        'vehicle-1',
        { name: 'New name', plate: '9999-XYZ', location },
        'owner-1',
      );

      expect(vehicleModelFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', ...accessFilterFor('owner-1') },
        { name: 'New name', plate: '9999-XYZ', location },
        { new: true },
      );
    });

    it('lets a shared user update the location', async () => {
      vehicleAccessFindOne.mockResolvedValue(vehicle);

      await service.update('vehicle-1', { location }, 'user-2');

      expect(vehicleModelFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', ...accessFilterFor('user-2') },
        { location },
        { new: true },
      );
    });

    it('writes only the location when a shared user resends the stored details', async () => {
      vehicleAccessFindOne.mockResolvedValue(vehicle);

      await service.update(
        'vehicle-1',
        {
          name: 'Car',
          model: 'Porsche',
          plate: '1234-ABC',
          imageUrl: 'image.png',
          location,
        },
        'user-2',
      );

      expect(vehicleModelFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', ...accessFilterFor('user-2') },
        { location },
        { new: true },
      );
    });

    it('treats a missing image and an empty image as the same value', async () => {
      vehicleAccessFindOne.mockResolvedValue({
        ...vehicle,
        imageUrl: undefined,
      });

      await service.update('vehicle-1', { imageUrl: '', location }, 'user-2');

      expect(vehicleModelFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', ...accessFilterFor('user-2') },
        { location },
        { new: true },
      );
    });

    it.each([
      ['name', 'Other'],
      ['model', 'Other'],
      ['plate', '9999-XYZ'],
      ['imageUrl', 'other.png'],
    ])('rejects a shared user who changes the %s', async (field, value) => {
      vehicleAccessFindOne.mockResolvedValue(vehicle);

      await expectHttpError(
        service.update(
          'vehicle-1',
          { [field]: value } as UpdateVehicleDto,
          'user-2',
        ),
        HttpStatus.FORBIDDEN,
        'Only the owner can edit the vehicle details',
      );

      expect(vehicleModelFindOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes the vehicle and all its events when the user is the owner', async () => {
      const vehicle = { _id: 'vehicle-1', userId: 'owner-1' };

      vehicleModelFindOneAndDelete.mockReturnValue(resolvingQuery(vehicle));

      await expect(service.delete('vehicle-1', 'owner-1')).resolves.toBe(
        vehicle,
      );

      expect(vehicleModelFindOneAndDelete).toHaveBeenCalledWith({
        _id: 'vehicle-1',
        userId: 'owner-1',
      });

      expect(eventsDeleteByVehicle).toHaveBeenCalledWith('vehicle-1');
    });

    it('does not delete anything when the user is not the owner', async () => {
      vehicleModelFindOneAndDelete.mockReturnValue(resolvingQuery(null));

      await expect(service.delete('vehicle-1', 'user-2')).resolves.toBeNull();

      expect(eventsDeleteByVehicle).not.toHaveBeenCalled();
    });
  });

  describe('addUserToVehicle', () => {
    it('adds the user with a single conditional update', async () => {
      vehicleModelFindOneAndUpdate.mockReturnValue(
        resolvingQuery({ _id: 'vehicle-1' }),
      );

      await expect(
        service.addUserToVehicle('vehicle-1', 'user-2', 'user@example.com'),
      ).resolves.toBeUndefined();

      expect(vehicleModelFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', 'users.userId': { $ne: 'user-2' } },
        { $push: { users: { userId: 'user-2', email: 'user@example.com' } } },
      );
    });

    it('rejects a user who already has access', async () => {
      vehicleModelFindOneAndUpdate.mockReturnValue(resolvingQuery(null));
      vehicleModelExists.mockReturnValue(resolvingQuery({ _id: 'vehicle-1' }));

      await expectHttpError(
        service.addUserToVehicle('vehicle-1', 'user-2', 'user@example.com'),
        HttpStatus.BAD_REQUEST,
        'User already has access to this vehicle',
      );
    });

    it('rejects a vehicle that does not exist', async () => {
      vehicleModelFindOneAndUpdate.mockReturnValue(resolvingQuery(null));
      vehicleModelExists.mockReturnValue(resolvingQuery(null));

      await expectHttpError(
        service.addUserToVehicle('vehicle-1', 'user-2', 'user@example.com'),
        HttpStatus.NOT_FOUND,
        'Vehicle not found',
      );
    });
  });

  describe('removeUserFromVehicle', () => {
    it('removes the user with a single update', async () => {
      vehicleModelFindOneAndUpdate.mockReturnValue(
        resolvingQuery({ _id: 'vehicle-1' }),
      );

      await expect(
        service.removeUserFromVehicle('vehicle-1', 'user-2'),
      ).resolves.toBeUndefined();

      expect(vehicleModelFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1' },
        { $pull: { users: { userId: 'user-2' } } },
      );
    });

    it('rejects a vehicle that does not exist', async () => {
      vehicleModelFindOneAndUpdate.mockReturnValue(resolvingQuery(null));

      await expectHttpError(
        service.removeUserFromVehicle('vehicle-1', 'user-2'),
        HttpStatus.NOT_FOUND,
        'Vehicle not found',
      );
    });
  });
});
