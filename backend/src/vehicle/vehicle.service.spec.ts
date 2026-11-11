import { Model } from 'mongoose';
import { EventsService } from '../events/events.service';
import { VehicleAccessService } from './access/vehicle-access.service';
import { VehicleDocument } from './schemas/vehicle.schema';
import { VehicleService } from './vehicle.service';

function resolvingQuery<T>(value: T) {
  return { exec: jest.fn().mockResolvedValue(value) };
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
        findAccessibleVehicle,
        isOwner: (vehicle: { userId: string }, userId: string) =>
          vehicle.userId === userId,
        buildAccessFilter: (userId: string) => ({
          $or: [{ userId }, { 'users.userId': userId }],
        }),
      } as unknown as VehicleAccessService,
      { deleteByVehicle } as unknown as EventsService,
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
});
