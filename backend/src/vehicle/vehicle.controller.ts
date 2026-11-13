import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleSharingService } from './vehicle-sharing.service';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { AddVehicleUserDto } from './dtos/add-vehicle-user.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';

@Controller('vehicles')
@UseGuards(FirebaseAuthGuard)
export class VehicleController {
  constructor(
    private readonly vehicleService: VehicleService,
    private readonly vehicleSharingService: VehicleSharingService,
  ) {}

  @Get()
  getAll(@CurrentUser('uid') userId: string) {
    return this.vehicleService.findAll(userId);
  }

  @Get(':id')
  getOne(
    @Param('id', ParseMongoIdPipe) id: string,
    @CurrentUser('uid') userId: string,
  ) {
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
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() vehicle: UpdateVehicleDto,
    @CurrentUser('uid') userId: string,
  ) {
    return this.vehicleService.update(id, vehicle, userId);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseMongoIdPipe) id: string,
    @CurrentUser('uid') userId: string,
  ) {
    return this.vehicleService.delete(id, userId);
  }

  @Post(':id/users')
  addUserByEmail(
    @Param('id', ParseMongoIdPipe) vehicleId: string,
    @Body() body: AddVehicleUserDto,
    @CurrentUser('uid') ownerId: string,
  ) {
    return this.vehicleSharingService.addUserByEmail(
      vehicleId,
      body.email,
      ownerId,
    );
  }

  @Delete(':id/users/:userId')
  removeUser(
    @Param('id', ParseMongoIdPipe) vehicleId: string,
    @Param('userId') userIdToRemove: string,
    @CurrentUser('uid') currentUserId: string,
  ) {
    return this.vehicleSharingService.removeUser(
      vehicleId,
      userIdToRemove,
      currentUserId,
    );
  }
}
