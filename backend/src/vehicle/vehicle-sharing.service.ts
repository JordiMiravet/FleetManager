import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FirebaseService } from '../auth/firebase/firebase.service';
import { VehicleAccessService } from './access/vehicle-access.service';
import { VehicleService } from './vehicle.service';

// An invalid email is reported as not found until the request validation
// rejects it before reaching Firebase (task #645).
const USER_NOT_FOUND_CODES = ['auth/user-not-found', 'auth/invalid-email'];

function isUserNotFoundError(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;

  return typeof code === 'string' && USER_NOT_FOUND_CODES.includes(code);
}

@Injectable()
export class VehicleSharingService {
  constructor(
    private readonly vehicleService: VehicleService,
    private readonly vehicleAccessService: VehicleAccessService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async addUserByEmail(
    vehicleId: string,
    email: string,
    ownerId: string,
  ): Promise<{ message: string; userId: string; email?: string }> {
    const vehicle = await this.vehicleAccessService.findAccessibleVehicle(
      vehicleId,
      ownerId,
    );
    if (!vehicle) {
      throw new HttpException(
        'Vehicle not found or you are not the owner',
        HttpStatus.NOT_FOUND,
      );
    }

    const userRecord = await this.findUserByEmail(email);

    if (userRecord.uid === ownerId) {
      throw new HttpException(
        'You cannot add yourself',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.vehicleService.addUserToVehicle(
      vehicleId,
      userRecord.uid,
      userRecord.email!,
    );

    return {
      message: 'User added successfully',
      userId: userRecord.uid,
      email: userRecord.email,
    };
  }

  async removeUser(
    vehicleId: string,
    userIdToRemove: string,
    currentUserId: string,
  ): Promise<{ message: string }> {
    const vehicle = await this.vehicleAccessService.findAccessibleVehicle(
      vehicleId,
      currentUserId,
    );
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }

    const isOwner = this.vehicleAccessService.isOwner(vehicle, currentUserId);
    const isSelfRemoval = currentUserId === userIdToRemove;

    if (!isOwner && !isSelfRemoval) {
      throw new HttpException(
        'You can only remove yourself or be the vehicle owner',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.vehicleService.removeUserFromVehicle(vehicleId, userIdToRemove);
    return { message: 'User removed successfully' };
  }

  private async findUserByEmail(email: string) {
    try {
      return await this.firebaseService.getUserByEmail(email);
    } catch (error) {
      if (isUserNotFoundError(error)) {
        throw new HttpException(
          'User not found with this email',
          HttpStatus.NOT_FOUND,
        );
      }
      throw error;
    }
  }
}
