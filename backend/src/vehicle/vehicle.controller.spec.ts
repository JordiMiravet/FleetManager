import { Test, TestingModule } from '@nestjs/testing';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { VehicleSharingService } from './vehicle-sharing.service';

jest.mock('./vehicle-sharing.service', () => ({
  VehicleSharingService: class VehicleSharingService {},
}));

jest.mock('../auth/firebase-auth.guard', () => ({
  FirebaseAuthGuard: class FirebaseAuthGuard {},
}));

describe('VehicleController', () => {
  let controller: VehicleController;

  const mockVehicleService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockVehicleSharingService = {
    addUserByEmail: jest.fn(),
    removeUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [
        { provide: VehicleService, useValue: mockVehicleService },
        {
          provide: VehicleSharingService,
          useValue: mockVehicleSharingService,
        },
      ],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return vehicles belonging to the user', async () => {
      const vehicles = [{ id: 'vehicle-1' }];
      mockVehicleService.findAll.mockResolvedValue(vehicles);

      await expect(controller.getAll('user-1')).resolves.toEqual(vehicles);
      expect(mockVehicleService.findAll.mock.calls).toEqual([['user-1']]);
    });
  });

  describe('getOne', () => {
    it('should return a vehicle belonging to the user', async () => {
      const vehicle = { id: 'vehicle-1' };
      mockVehicleService.findOne.mockResolvedValue(vehicle);

      await expect(controller.getOne('vehicle-1', 'user-1')).resolves.toEqual(
        vehicle,
      );

      expect(mockVehicleService.findOne.mock.calls).toEqual([
        ['vehicle-1', 'user-1'],
      ]);
    });
  });
});
