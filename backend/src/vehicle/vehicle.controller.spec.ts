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

  describe('create', () => {
    it('should create a vehicle for the user', async () => {
      const dto = {
        name: 'My Toyota',
        brand: 'Toyota',
        model: 'Corolla',
        plate: '1234ABC',
        location: { lat: 41.3851, lng: 2.1734 },
      };
      const vehicle = { id: 'vehicle-1', ...dto };
      mockVehicleService.create.mockResolvedValue(vehicle);

      await expect(controller.create(dto, 'user-1')).resolves.toEqual(vehicle);

      expect(mockVehicleService.create.mock.calls).toEqual([[dto, 'user-1']]);
    });
  });

  describe('update', () => {
    it('should update a vehicle belonging to the user', async () => {
      const dto = { model: 'Yaris' };
      const vehicle = { id: 'vehicle-1', ...dto };
      mockVehicleService.update.mockResolvedValue(vehicle);

      await expect(
        controller.update('vehicle-1', dto, 'user-1'),
      ).resolves.toEqual(vehicle);

      expect(mockVehicleService.update.mock.calls).toEqual([
        ['vehicle-1', dto, 'user-1'],
      ]);
    });
  });

  describe('delete', () => {
    it('should delete a vehicle belonging to the user', async () => {
      mockVehicleService.delete.mockResolvedValue(undefined);

      await expect(
        controller.delete('vehicle-1', 'user-1'),
      ).resolves.toBeUndefined();

      expect(mockVehicleService.delete.mock.calls).toEqual([
        ['vehicle-1', 'user-1'],
      ]);
    });
  });

  describe('addUserByEmail', () => {
    it('should add a user to a vehicle', async () => {
      const result = { success: true };
      mockVehicleSharingService.addUserByEmail.mockResolvedValue(result);

      await expect(
        controller.addUserByEmail(
          'vehicle-1',
          { email: 'user@example.com' },
          'owner-1',
        ),
      ).resolves.toEqual(result);

      expect(mockVehicleSharingService.addUserByEmail.mock.calls).toEqual([
        ['vehicle-1', 'user@example.com', 'owner-1'],
      ]);
    });
  });

  describe('removeUser', () => {
    it('should remove a user from a vehicle', async () => {
      const result = { success: true };
      mockVehicleSharingService.removeUser.mockResolvedValue(result);

      await expect(
        controller.removeUser('vehicle-1', 'user-2', 'owner-1'),
      ).resolves.toEqual(result);

      expect(mockVehicleSharingService.removeUser.mock.calls).toEqual([
        ['vehicle-1', 'user-2', 'owner-1'],
      ]);
    });
  });
});
