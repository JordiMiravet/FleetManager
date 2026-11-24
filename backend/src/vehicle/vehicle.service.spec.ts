import { HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  buildCreateVehicleDto,
  buildVehicle,
  type VehicleFixture,
} from '../common/testing/builders';
import { expectHttpError } from '../common/testing/expect-http-error';
import { resolvingQuery } from '../common/testing/mongoose-mocks';
import { EventsService } from '../events/events.service';
import { VehicleAccessService } from './access/vehicle-access.service';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { VehicleDocument } from './schemas/vehicle.schema';
import { VehicleService } from './vehicle.service';

interface VehicleModelMock extends jest.Mock {
  findOneAndUpdate: jest.Mock;
  findOneAndDelete: jest.Mock;
  exists: jest.Mock;
}

const LOCATION = { lat: 1, lng: 2 };
const NOT_FOUND = 'Vehicle not found';

const accessFilterFor = (userId: string) => ({
  $or: [{ userId }, { 'users.userId': userId }],
});

describe('VehicleService', () => {
  let vehicleModel: VehicleModelMock;
  let saveVehicle: jest.Mock;
  let findAccessibleVehicle: jest.Mock;
  let findAccessibleVehicles: jest.Mock;
  let deleteByVehicle: jest.Mock;
  let service: VehicleService;

  beforeEach(() => {
    saveVehicle = jest.fn();
    vehicleModel = Object.assign(
      jest.fn().mockImplementation((data: Record<string, unknown>) => ({
        ...data,
        save: saveVehicle,
      })),
      {
        findOneAndUpdate: jest.fn(),
        findOneAndDelete: jest.fn(),
        exists: jest.fn(),
      },
    );
    findAccessibleVehicle = jest.fn();
    findAccessibleVehicles = jest.fn();
    deleteByVehicle = jest.fn().mockResolvedValue(undefined);

    service = new VehicleService(
      vehicleModel as unknown as Model<VehicleDocument>,
      { deleteByVehicle } as unknown as EventsService,
      {
        findAccessibleVehicle,
        findAccessibleVehicles,
        isOwner: (found: { userId: string }, userId: string) =>
          found.userId === userId,
        buildAccessFilter: accessFilterFor,
      } as unknown as VehicleAccessService,
    );
  });

  describe('findAll', () => {
    it('returns all the vehicles accessible by the user', async () => {
      const vehicles = [{ _id: 'vehicle-1' }, { _id: 'vehicle-2' }];
      findAccessibleVehicles.mockResolvedValue(vehicles);

      await expect(service.findAll('user-1')).resolves.toBe(vehicles);

      expect(findAccessibleVehicles).toHaveBeenCalledWith('user-1');
    });

    it('returns an empty list when the user has no accessible vehicles', async () => {
      findAccessibleVehicles.mockResolvedValue([]);

      await expect(service.findAll('user-1')).resolves.toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns the vehicle when the user can access it', async () => {
      const vehicle = buildVehicle();
      findAccessibleVehicle.mockResolvedValue(vehicle);

      await expect(service.findOne('vehicle-1', 'owner-1')).resolves.toBe(
        vehicle,
      );
      expect(findAccessibleVehicle).toHaveBeenCalledWith(
        'vehicle-1',
        'owner-1',
      );
    });

    it('reports a vehicle the user cannot access as not found', async () => {
      findAccessibleVehicle.mockResolvedValue(null);

      await expectHttpError(
        service.findOne('vehicle-1', 'stranger'),
        HttpStatus.NOT_FOUND,
        NOT_FOUND,
      );
    });
  });

  describe('create', () => {
    it('creates and saves a vehicle for the user', async () => {
      const dto = buildCreateVehicleDto();
      const savedVehicle = { ...dto, userId: 'user-1' };
      saveVehicle.mockResolvedValue(savedVehicle);

      await expect(service.create(dto, 'user-1')).resolves.toBe(savedVehicle);

      expect(vehicleModel).toHaveBeenCalledWith({ ...dto, userId: 'user-1' });
      expect(saveVehicle).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const storedDetails = {
      name: 'Car',
      model: 'Porsche',
      plate: '1234-ABC',
      imageUrl: 'image.png',
    };

    const expectUpdateWith = (userId: string, data: object) =>
      expect(vehicleModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', ...accessFilterFor(userId) },
        data,
        { new: true },
      );

    beforeEach(() => {
      findAccessibleVehicle.mockResolvedValue(buildVehicle());
      vehicleModel.findOneAndUpdate.mockReturnValue(
        resolvingQuery({ updated: true }),
      );
    });

    describe('when the vehicle cannot be updated', () => {
      it('rejects a vehicle the user cannot access', async () => {
        findAccessibleVehicle.mockResolvedValue(null);

        await expectHttpError(
          service.update('vehicle-1', { name: 'New' }, 'stranger'),
          HttpStatus.NOT_FOUND,
          NOT_FOUND,
        );
        expect(vehicleModel.findOneAndUpdate).not.toHaveBeenCalled();
      });

      it('rejects a vehicle that was deleted during the update', async () => {
        vehicleModel.findOneAndUpdate.mockReturnValue(resolvingQuery(null));

        await expectHttpError(
          service.update('vehicle-1', { name: 'New' }, 'owner-1'),
          HttpStatus.NOT_FOUND,
          NOT_FOUND,
        );
      });
    });

    describe('as the owner', () => {
      it('lets the owner update every field', async () => {
        await service.update(
          'vehicle-1',
          { name: 'New name', plate: '9999-XYZ', location: LOCATION },
          'owner-1',
        );

        expectUpdateWith('owner-1', {
          name: 'New name',
          plate: '9999-XYZ',
          location: LOCATION,
        });
      });
    });

    describe('as a shared user', () => {
      describe('allowed changes', () => {
        it('updates the location', async () => {
          await service.update('vehicle-1', { location: LOCATION }, 'user-2');

          expectUpdateWith('user-2', { location: LOCATION });
        });

        it.each<[string, UpdateVehicleDto, object]>([
          [
            'with a location',
            { ...storedDetails, location: LOCATION },
            { location: LOCATION },
          ],
          ['without a location', storedDetails, {}],
        ])(
          'writes only the allowed changes when it resends the stored details %s',
          async (_label, changes, written) => {
            await service.update('vehicle-1', changes, 'user-2');

            expectUpdateWith('user-2', written);
          },
        );

        it('accepts a request without owner-only fields', async () => {
          await service.update('vehicle-1', {}, 'user-2');

          expectUpdateWith('user-2', {});
        });
      });

      describe('equivalent empty values', () => {
        it.each<[string, Partial<VehicleFixture>, UpdateVehicleDto]>([
          [
            'an empty image against a missing one',
            { imageUrl: undefined },
            { imageUrl: '' },
          ],
          [
            'a null image against an empty one',
            { imageUrl: '' },
            { imageUrl: null as unknown as string },
          ],
          [
            'an empty image against a null one',
            { imageUrl: null },
            { imageUrl: '' },
          ],
        ])('treats %s as unchanged', async (_label, stored, changes) => {
          findAccessibleVehicle.mockResolvedValue(buildVehicle(stored));

          await service.update('vehicle-1', changes, 'user-2');

          expectUpdateWith('user-2', {});
        });
      });

      describe('owner-only fields', () => {
        it.each([
          ['name', 'Other'],
          ['model', 'Other'],
          ['plate', '9999-XYZ'],
          ['imageUrl', 'other.png'],
        ])('rejects a change of the %s', async (field, value) => {
          await expectHttpError(
            service.update(
              'vehicle-1',
              { [field]: value } as UpdateVehicleDto,
              'user-2',
            ),
            HttpStatus.FORBIDDEN,
            'Only the owner can edit the vehicle details',
          );
          expect(vehicleModel.findOneAndUpdate).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('delete', () => {
    const vehicle = buildVehicle();

    beforeEach(() => {
      findAccessibleVehicle.mockResolvedValue(vehicle);
      vehicleModel.findOneAndDelete.mockReturnValue(resolvingQuery(vehicle));
    });

    it('deletes the vehicle and all its events when the user is the owner', async () => {
      await expect(service.delete('vehicle-1', 'owner-1')).resolves.toBe(
        vehicle,
      );

      expect(vehicleModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: 'vehicle-1',
        userId: 'owner-1',
      });
      expect(deleteByVehicle).toHaveBeenCalledWith('vehicle-1');
    });

    describe('when the vehicle cannot be deleted', () => {
      it('rejects a vehicle the user cannot access', async () => {
        findAccessibleVehicle.mockResolvedValue(null);

        await expectHttpError(
          service.delete('vehicle-1', 'stranger'),
          HttpStatus.NOT_FOUND,
          NOT_FOUND,
        );
        expect(vehicleModel.findOneAndDelete).not.toHaveBeenCalled();
        expect(deleteByVehicle).not.toHaveBeenCalled();
      });

      it('rejects a shared user who is not the owner', async () => {
        await expectHttpError(
          service.delete('vehicle-1', 'user-2'),
          HttpStatus.FORBIDDEN,
          'Only the owner can delete the vehicle',
        );
        expect(vehicleModel.findOneAndDelete).not.toHaveBeenCalled();
        expect(deleteByVehicle).not.toHaveBeenCalled();
      });

      it('does not delete the events when the vehicle was already deleted', async () => {
        vehicleModel.findOneAndDelete.mockReturnValue(resolvingQuery(null));

        await expectHttpError(
          service.delete('vehicle-1', 'owner-1'),
          HttpStatus.NOT_FOUND,
          NOT_FOUND,
        );
        expect(deleteByVehicle).not.toHaveBeenCalled();
      });
    });

    it('propagates the error when deleting the events fails', async () => {
      deleteByVehicle.mockRejectedValue(new Error('Failed to delete events'));

      await expect(service.delete('vehicle-1', 'owner-1')).rejects.toThrow(
        'Failed to delete events',
      );
      expect(deleteByVehicle).toHaveBeenCalledWith('vehicle-1');
    });
  });

  describe('addUserToVehicle', () => {
    const add = () =>
      service.addUserToVehicle('vehicle-1', 'user-2', 'user@example.com');

    it('adds the user with a single conditional update', async () => {
      vehicleModel.findOneAndUpdate.mockReturnValue(
        resolvingQuery({ _id: 'vehicle-1' }),
      );

      await expect(add()).resolves.toBeUndefined();

      expect(vehicleModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1', 'users.userId': { $ne: 'user-2' } },
        { $push: { users: { userId: 'user-2', email: 'user@example.com' } } },
      );
    });

    describe('when the user cannot be added', () => {
      beforeEach(() => {
        vehicleModel.findOneAndUpdate.mockReturnValue(resolvingQuery(null));
      });

      it('rejects a user who already has access', async () => {
        vehicleModel.exists.mockReturnValue(
          resolvingQuery({ _id: 'vehicle-1' }),
        );

        await expectHttpError(
          add(),
          HttpStatus.BAD_REQUEST,
          'User already has access to this vehicle',
        );
      });

      it('rejects a vehicle that does not exist', async () => {
        vehicleModel.exists.mockReturnValue(resolvingQuery(null));

        await expectHttpError(add(), HttpStatus.NOT_FOUND, NOT_FOUND);
      });
    });
  });

  describe('removeUserFromVehicle', () => {
    const remove = () => service.removeUserFromVehicle('vehicle-1', 'user-2');

    it('removes the user with a single update', async () => {
      vehicleModel.findOneAndUpdate.mockReturnValue(
        resolvingQuery({ _id: 'vehicle-1' }),
      );

      await expect(remove()).resolves.toBeUndefined();

      expect(vehicleModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'vehicle-1' },
        { $pull: { users: { userId: 'user-2' } } },
      );
    });

    it('rejects a vehicle that does not exist', async () => {
      vehicleModel.findOneAndUpdate.mockReturnValue(resolvingQuery(null));

      await expectHttpError(remove(), HttpStatus.NOT_FOUND, NOT_FOUND);
    });
  });
});
