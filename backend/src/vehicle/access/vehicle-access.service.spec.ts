import { Model } from 'mongoose';
import { Vehicle } from '../schemas/vehicle.schema';
import { VehicleAccessService } from './vehicle-access.service';

describe('VehicleAccessService', () => {
  const accessFilter = {
    $or: [{ userId: 'user-1' }, { 'users.userId': 'user-1' }],
  };

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

  it('builds a filter for the owner or a shared user', () => {
    expect(service.buildAccessFilter('user-1')).toEqual(accessFilter);
  });

  it('finds the vehicles the user can access', async () => {
    const vehicles = [{ name: 'Car' }];
    find.mockReturnValue({ exec: jest.fn().mockResolvedValue(vehicles) });

    await expect(service.findAccessibleVehicles('user-1')).resolves.toBe(
      vehicles,
    );
    expect(find).toHaveBeenCalledWith(accessFilter);
  });

  it('finds one accessible vehicle by id', async () => {
    const vehicle = { name: 'Car' };
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(vehicle) });

    await expect(
      service.findAccessibleVehicle('vehicle-1', 'user-1'),
    ).resolves.toBe(vehicle);
    expect(findOne).toHaveBeenCalledWith({
      _id: 'vehicle-1',
      ...accessFilter,
    });
  });

  it('returns the ids of the accessible vehicles as strings', async () => {
    const exec = jest
      .fn()
      .mockResolvedValue([
        { _id: { toString: () => 'id-1' } },
        { _id: { toString: () => 'id-2' } },
      ]);
    const select = jest.fn().mockReturnValue({ exec });
    find.mockReturnValue({ select });

    await expect(service.findAccessibleVehicleIds('user-1')).resolves.toEqual([
      'id-1',
      'id-2',
    ]);
    expect(find).toHaveBeenCalledWith(accessFilter);
    expect(select).toHaveBeenCalledWith('_id');
  });

  it('recognizes the owner of a vehicle', () => {
    expect(service.isOwner({ userId: 'user-1' } as Vehicle, 'user-1')).toBe(
      true,
    );
  });

  it('does not treat a shared user as the owner', () => {
    expect(service.isOwner({ userId: 'user-1' } as Vehicle, 'user-2')).toBe(
      false,
    );
  });
});
