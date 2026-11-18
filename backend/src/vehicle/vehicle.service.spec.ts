import { Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
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
      const vehicles = [{ _id: 'vehicle-1' }, { _id: 'vehicle-2' }];

      vehicleAccessFindAll.mockResolvedValue(vehicles);

      await expect(service.findAll('user-1')).resolves.toBe(vehicles);

      expect(vehicleAccessFindAll).toHaveBeenCalledWith('user-1');
    });

    it('returns an empty array when the user has no accessible vehicles', async () => {
      vehicleAccessFindAll.mockResolvedValue([]);

      await expect(service.findAll('user-1')).resolves.toEqual([]);

      expect(vehicleAccessFindAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findOne', () => {
    it('returns the vehicle when the user can access it', async () => {
      const vehicle = { _id: 'vehicle-1', userId: 'owner-1' };
      vehicleAccessFindOne.mockResolvedValue(vehicle);

      await expect(service.findOne('vehicle-1', 'owner-1')).resolves.toBe(
        vehicle,
      );
      expect(vehicleAccessFindOne).toHaveBeenCalledWith('vehicle-1', 'owner-1');
    });

    it('reports a vehicle the user cannot access as not found', async () => {
      vehicleAccessFindOne.mockResolvedValue(null);

      await expectHttpError(
        service.findOne('vehicle-1', 'stranger'),
        HttpStatus.NOT_FOUND,
        'Vehicle not found',
      );
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

    it('reports a vehicle the user cannot access as not found', async () => {
      vehicleAccessFindOne.mockResolvedValue(null);

      await expectHttpError(
        service.update('vehicle-1', { name: 'New' }, 'stranger'),
        HttpStatus.NOT_FOUND,
        'Vehicle not found',
      );
      expect(vehicleModelFindOneAndUpdate).not.toHaveBeenCalled();
    });

    it('reports as not found a vehicle that was deleted during the update', async () => {
      vehicleAccessFindOne.mockResolvedValue(vehicle);
      vehicleModelFindOneAndUpdate.mockReturnValue(resolvingQuery(null));

      await expectHttpError(
        service.update('vehicle-1', { name: 'New' }, 'owner-1'),
        HttpStatus.NOT_FOUND,
        'Vehicle not found',
      );
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

    it('allows a shared user to submit unchanged details without a location', async () => {
      vehicleAccessFindOne.mockResolvedValue(vehicle);

      await service.update(
        'vehicle-1',
        {
          name: 'Car',
          model: 'Porsche',
          plate: '1234-ABC',
          imageUrl: 'image.png',
        },
        'user-2',
      );

      expect(vehicleModelFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', ...accessFilterFor('user-2') },
        {},
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
    it('allows a shared user when owner-only fields are omitted', async () => {
      vehicleAccessFindOne.mockResolvedValue(vehicle);

      await service.update('vehicle-1', {}, 'user-2');

      expect(vehicleModelFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', ...accessFilterFor('user-2') },
        {},
        { new: true },
      );
    });

    it('allows a shared user when an empty owner-only field matches an undefined stored value', async () => {
      vehicleAccessFindOne.mockResolvedValue({
        ...vehicle,
        imageUrl: undefined,
      });

      await service.update('vehicle-1', { imageUrl: '' }, 'user-2');

      expect(vehicleModelFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', ...accessFilterFor('user-2') },
        {},
        { new: true },
      );
    });

    it('allows a shared user when an owner-only field is null and stored value is empty', async () => {
      vehicleAccessFindOne.mockResolvedValue({
        ...vehicle,
        imageUrl: '',
      });

      await service.update(
        'vehicle-1',
        { imageUrl: null as unknown as string },
        'user-2',
      );

      expect(vehicleModelFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', ...accessFilterFor('user-2') },
        {},
        { new: true },
      );
    });

    it('allows a shared user when a stored owner-only field is null and submitted value is empty', async () => {
      vehicleAccessFindOne.mockResolvedValue({
        ...vehicle,
        imageUrl: null,
      });

      await service.update('vehicle-1', { imageUrl: '' }, 'user-2');

      expect(vehicleModelFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', ...accessFilterFor('user-2') },
        {},
        { new: true },
      );
    });
  });

  describe('create', () => {
    it('creates and saves a vehicle for the user', async () => {
      const vehicleDto = {
        name: 'Car',
        model: 'Porsche',
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

  describe('delete', () => {
    const vehicle = { _id: 'vehicle-1', userId: 'owner-1' };

    it('deletes the vehicle and all its events when the user is the owner', async () => {
      vehicleAccessFindOne.mockResolvedValue(vehicle);
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

    it('reports a vehicle the user cannot access as not found', async () => {
      vehicleAccessFindOne.mockResolvedValue(null);

      await expectHttpError(
        service.delete('vehicle-1', 'stranger'),
        HttpStatus.NOT_FOUND,
        'Vehicle not found',
      );

      expect(vehicleModelFindOneAndDelete).not.toHaveBeenCalled();
      expect(eventsDeleteByVehicle).not.toHaveBeenCalled();
    });

    it('rejects a shared user who is not the owner', async () => {
      vehicleAccessFindOne.mockResolvedValue(vehicle);

      await expectHttpError(
        service.delete('vehicle-1', 'user-2'),
        HttpStatus.FORBIDDEN,
        'Only the owner can delete the vehicle',
      );

      expect(vehicleModelFindOneAndDelete).not.toHaveBeenCalled();
      expect(eventsDeleteByVehicle).not.toHaveBeenCalled();
    });

    it('does not delete events when the vehicle was already deleted', async () => {
      vehicleAccessFindOne.mockResolvedValue(vehicle);
      vehicleModelFindOneAndDelete.mockReturnValue(resolvingQuery(null));

      await expectHttpError(
        service.delete('vehicle-1', 'owner-1'),
        HttpStatus.NOT_FOUND,
        'Vehicle not found',
      );

      expect(eventsDeleteByVehicle).not.toHaveBeenCalled();
    });

    it('propagates errors when deleting vehicle events fails', async () => {
      vehicleAccessFindOne.mockResolvedValue(vehicle);
      vehicleModelFindOneAndDelete.mockReturnValue(resolvingQuery(vehicle));

      eventsDeleteByVehicle.mockRejectedValue(
        new Error('Failed to delete events'),
      );

      await expect(service.delete('vehicle-1', 'owner-1')).rejects.toThrow(
        'Failed to delete events',
      );

      expect(eventsDeleteByVehicle).toHaveBeenCalledWith('vehicle-1');
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
