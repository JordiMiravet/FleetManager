import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { FirebaseService } from '../auth/firebase/firebase.service';

@Controller('vehicles')
@UseGuards(FirebaseAuthGuard)
export class VehicleController {
  constructor(
    private readonly vehicleService: VehicleService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Get()
  getAll(@CurrentUser('uid') userId: string) {
    return this.vehicleService.findAll(userId);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @CurrentUser('uid') userId: string) {
    return this.vehicleService.findOne(id, userId);
  }

  @Post()
  create(
    @Body() vehicle: CreateVehicleDto,
    @CurrentUser('uid') userId: string,
  ) {
    return this.vehicleService.create(vehicle, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() vehicle: UpdateVehicleDto,
    @CurrentUser('uid') userId: string,
  ) {
    return this.vehicleService.update(id, vehicle, userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser('uid') userId: string) {
    return this.vehicleService.delete(id, userId);
  }

  @Post(':id/users')
  async addUserByEmail(
    @Param('id') vehicleId: string,
    @Body('email') email: string,
    @CurrentUser('uid') ownerId: string,
  ) {
    const vehicle = await this.vehicleService.findOne(vehicleId, ownerId);
    if (!vehicle) {
      throw new HttpException(
        'Vehicle not found or you are not the owner',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const userRecord = await this.firebaseService.getUserByEmail(email);

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
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'User not found with this email',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete(':id/users/:userId')
  async removeUser(
    @Param('id') vehicleId: string,
    @Param('userId') userIdToRemove: string,
    @CurrentUser('uid') currentUserId: string,
  ) {
    const vehicle = await this.vehicleService.findOne(vehicleId, currentUserId);
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }

    const isOwner = vehicle.userId === currentUserId;
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
}
