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
  let findOneAndUpdate: jest.Mock;
  let findOneAndDelete: jest.Mock;
  let exists: jest.Mock;
  let findAccessibleVehicle: jest.Mock;
  let deleteByVehicle: jest.Mock;
  let service: VehicleService;

  beforeEach(() => {
    findOneAndUpdate = jest.fn();
    findOneAndDelete = jest.fn();
    exists = jest.fn();
    findAccessibleVehicle = jest.fn();
    deleteByVehicle = jest.fn().mockResolvedValue(undefined);

    service = new VehicleService(
      {
        findOneAndUpdate,
        findOneAndDelete,
        exists,
      } as unknown as Model<VehicleDocument>,
      {
        deleteByVehicle,
      } as unknown as EventsService,
      {
        findAccessibleVehicle,
        isOwner: (vehicle: { userId: string }, userId: string) =>
          vehicle.userId === userId,
        buildAccessFilter: (userId: string) => ({
          $or: [{ userId }, { 'users.userId': userId }],
        }),
      } as unknown as VehicleAccessService,
    );
  });

  describe('delete', () => {
    it('deletes the vehicle and all its events when the user is the owner', async () => {
      const vehicle = { _id: 'vehicle-1', userId: 'owner-1' };
      findOneAndDelete.mockReturnValue(resolvingQuery(vehicle));

      await expect(service.delete('vehicle-1', 'owner-1')).resolves.toBe(
        vehicle,
      );
      expect(findOneAndDelete).toHaveBeenCalledWith({
        _id: 'vehicle-1',
        userId: 'owner-1',
      });
      expect(deleteByVehicle).toHaveBeenCalledWith('vehicle-1');
    });

    it('does not delete anything when the user is not the owner', async () => {
      findOneAndDelete.mockReturnValue(resolvingQuery(null));

      await expect(service.delete('vehicle-1', 'user-2')).resolves.toBeNull();
      expect(deleteByVehicle).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const vehicle = {
      _id: 'vehicle-1',
      userId: 'owner-1',
      name: 'Car',
      model: 'Model',
      plate: '1234-ABC',
      imageUrl: 'image.png',
    };
    const location = { lat: 1, lng: 2 };

    function accessFilterFor(userId: string) {
      return { $or: [{ userId }, { 'users.userId': userId }] };
    }

    beforeEach(() => {
      findOneAndUpdate.mockReturnValue(resolvingQuery({ updated: true }));
    });

    it('returns null without updating when the vehicle is not accessible', async () => {
      findAccessibleVehicle.mockResolvedValue(null);

      await expect(
        service.update('vehicle-1', { name: 'New' }, 'stranger'),
      ).resolves.toBeNull();
      expect(findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('lets the owner update every field', async () => {
      findAccessibleVehicle.mockResolvedValue(vehicle);

      await service.update(
        'vehicle-1',
        { name: 'New name', plate: '9999-XYZ', location },
        'owner-1',
      );

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', ...accessFilterFor('owner-1') },
        { name: 'New name', plate: '9999-XYZ', location },
        { new: true },
      );
    });

    it('lets a shared user update the location', async () => {
      findAccessibleVehicle.mockResolvedValue(vehicle);

      await service.update('vehicle-1', { location }, 'user-2');

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', ...accessFilterFor('user-2') },
        { location },
        { new: true },
      );
    });

    it('writes only the location when a shared user resends the stored details', async () => {
      findAccessibleVehicle.mockResolvedValue(vehicle);

      await service.update(
        'vehicle-1',
        {
          name: 'Car',
          model: 'Model',
          plate: '1234-ABC',
          imageUrl: 'image.png',
          location,
        },
        'user-2',
      );

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', ...accessFilterFor('user-2') },
        { location },
        { new: true },
      );
    });

    it('treats a missing image and an empty image as the same value', async () => {
      findAccessibleVehicle.mockResolvedValue({
        ...vehicle,
        imageUrl: undefined,
      });

      await service.update('vehicle-1', { imageUrl: '', location }, 'user-2');

      expect(findOneAndUpdate).toHaveBeenCalledWith(
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
      findAccessibleVehicle.mockResolvedValue(vehicle);

      await expectHttpError(
        service.update(
          'vehicle-1',
          { [field]: value } as UpdateVehicleDto,
          'user-2',
        ),
        HttpStatus.FORBIDDEN,
        'Only the owner can edit the vehicle details',
      );
      expect(findOneAndUpdate).not.toHaveBeenCalled();
    });
  });
});
