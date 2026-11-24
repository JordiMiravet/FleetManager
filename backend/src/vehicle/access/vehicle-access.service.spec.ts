import { Model } from 'mongoose';
import { resolvingQuery } from '../../common/testing/mongoose-mocks';
import { Vehicle } from '../schemas/vehicle.schema';
import { VehicleAccessService } from './vehicle-access.service';

const accessFilterFor = (userId: string) => ({
  $or: [{ userId }, { 'users.userId': userId }],
});

const withId = (id: string) => ({ _id: { toString: () => id } });

describe('VehicleAccessService', () => {
  let find: jest.Mock;
  let findOne: jest.Mock;
  let service: VehicleAccessService;

  beforeEach(() => {
    find = jest.fn();
    findOne = jest.fn();
    service = new VehicleAccessService({
      find,
      findOne,
    } as unknown as Model<Vehicle>);
  });

  describe('buildAccessFilter', () => {
    it.each(['user-1', 'user-2'])(
      'matches the owner or a shared user for %s',
      (userId) => {
        expect(service.buildAccessFilter(userId)).toEqual(
          accessFilterFor(userId),
        );
      },
    );
  });

  describe('findAccessibleVehicles', () => {
    it('returns the vehicles the user can access', async () => {
      const vehicles = [{ name: 'Car' }];
      find.mockReturnValue(resolvingQuery(vehicles));

      await expect(service.findAccessibleVehicles('user-1')).resolves.toBe(
        vehicles,
      );
      expect(find).toHaveBeenCalledWith(accessFilterFor('user-1'));
    });

    it('returns an empty list when the user has none', async () => {
      find.mockReturnValue(resolvingQuery([]));

      await expect(service.findAccessibleVehicles('user-1')).resolves.toEqual(
        [],
      );
    });
  });

  describe('findAccessibleVehicle', () => {
    it('returns the vehicle when the user can access it', async () => {
      const vehicle = { name: 'Car' };
      findOne.mockReturnValue(resolvingQuery(vehicle));

      await expect(
        service.findAccessibleVehicle('vehicle-1', 'user-1'),
      ).resolves.toBe(vehicle);
      expect(findOne).toHaveBeenCalledWith({
        _id: 'vehicle-1',
        ...accessFilterFor('user-1'),
      });
    });

    it('returns null when the user cannot access it', async () => {
      findOne.mockReturnValue(resolvingQuery(null));

      await expect(
        service.findAccessibleVehicle('vehicle-1', 'stranger'),
      ).resolves.toBeNull();
    });
  });

  describe('findAccessibleVehicleIds', () => {
    let select: jest.Mock;

    const mockVehicles = (vehicles: object[]) => {
      select = jest.fn().mockReturnValue(resolvingQuery(vehicles));
      find.mockReturnValue({ select });
    };

    it('returns the ids of the accessible vehicles as strings', async () => {
      mockVehicles([withId('id-1'), withId('id-2')]);

      await expect(service.findAccessibleVehicleIds('user-1')).resolves.toEqual(
        ['id-1', 'id-2'],
      );
      expect(find).toHaveBeenCalledWith(accessFilterFor('user-1'));
    });

    it('selects only the id field', async () => {
      mockVehicles([]);

      await service.findAccessibleVehicleIds('user-1');

      expect(select).toHaveBeenCalledWith('_id');
    });

    it('returns an empty list when the user has no vehicles', async () => {
      mockVehicles([]);

      await expect(service.findAccessibleVehicleIds('user-1')).resolves.toEqual(
        [],
      );
    });
  });

  describe('isOwner', () => {
    it.each<[boolean, string, string]>([
      [true, 'the owner', 'user-1'],
      [false, 'a shared user', 'user-2'],
      [false, 'an empty id', ''],
    ])('returns %s for %s', (expected, _label, userId) => {
      expect(service.isOwner({ userId: 'user-1' } as Vehicle, userId)).toBe(
        expected,
      );
    });
  });
});
