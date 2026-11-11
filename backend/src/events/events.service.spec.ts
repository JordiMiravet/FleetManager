import { Model } from 'mongoose';
import { Event } from './schemas/event.schema';
import { VehicleAccessService } from '../vehicle/access/vehicle-access.service';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let deleteMany: jest.Mock;
  let service: EventsService;

  beforeEach(() => {
    deleteMany = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 2 }),
    });
    service = new EventsService(
      { deleteMany } as unknown as Model<Event>,
      {} as VehicleAccessService,
    );
  });

  describe('deleteByVehicle', () => {
    it('deletes every event of the vehicle whoever created it', async () => {
      await service.deleteByVehicle('vehicle-1');

      expect(deleteMany).toHaveBeenCalledWith({ vehicleId: 'vehicle-1' });
    });
  });
});
