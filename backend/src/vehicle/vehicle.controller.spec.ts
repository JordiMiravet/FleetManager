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
});
