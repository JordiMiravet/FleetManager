import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { VehicleAccessService } from './access/vehicle-access.service';
import { EventsService } from '../events/events.service';

const OWNER_ONLY_FIELDS = ['name', 'model', 'plate', 'imageUrl'] as const;

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
    private readonly eventsService: EventsService,
    private readonly vehicleAccessService: VehicleAccessService,
  ) {}

  async findAll(userId: string): Promise<Vehicle[]> {
    return this.vehicleAccessService.findAccessibleVehicles(userId);
  }

  async findOne(_id: string, userId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleAccessService.findAccessibleVehicle(
      _id,
      userId,
    );

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async create(vehicleDto: CreateVehicleDto, userId: string): Promise<Vehicle> {
    const newVehicle = new this.vehicleModel({
      ...vehicleDto,
      userId,
    });
    return newVehicle.save();
  }

  async update(
    _id: string,
    updatedVehicle: UpdateVehicleDto,
    userId: string,
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleAccessService.findAccessibleVehicle(
      _id,
      userId,
    );
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const isOwner = this.vehicleAccessService.isOwner(vehicle, userId);
    if (!isOwner) {
      this.assertOnlyLocationChanges(vehicle, updatedVehicle);
    }

    const updateData: Partial<Vehicle> = isOwner
      ? ({ ...updatedVehicle } as Partial<Vehicle>)
      : {};

    if (updatedVehicle.location) {
      updateData.location = {
        lat: updatedVehicle.location.lat,
        lng: updatedVehicle.location.lng,
      };
    }

    const savedVehicle = await this.vehicleModel
      .findOneAndUpdate(
        { _id, ...this.vehicleAccessService.buildAccessFilter(userId) },
        updateData,
        { new: true },
      )
      .exec();

    if (!savedVehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return savedVehicle;
  }

  private assertOnlyLocationChanges(
    vehicle: Vehicle,
    changes: UpdateVehicleDto,
  ): void {
    const changesOwnerOnlyField = OWNER_ONLY_FIELDS.some(
      (field) =>
        changes[field] !== undefined &&
        (changes[field] ?? '') !== (vehicle[field] ?? ''),
    );

    if (changesOwnerOnlyField) {
      throw new HttpException(
        'Only the owner can edit the vehicle details',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async delete(_id: string, userId: string): Promise<Vehicle | null> {
    const deletedVehicle = await this.vehicleModel
      .findOneAndDelete({ _id, userId })
      .exec();

    if (deletedVehicle) {
      await this.eventsService.deleteByVehicle(_id);
    }

    return deletedVehicle;
  }

  async addUserToVehicle(
    vehicleId: string,
    userId: string,
    email: string,
  ): Promise<void> {
    const updatedVehicle = await this.vehicleModel
      .findOneAndUpdate(
        { _id: vehicleId, 'users.userId': { $ne: userId } },
        { $push: { users: { userId, email } } },
      )
      .exec();

    if (updatedVehicle) {
      return;
    }

    const vehicleExists = await this.vehicleModel
      .exists({ _id: vehicleId })
      .exec();
    if (!vehicleExists) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }

    throw new HttpException(
      'User already has access to this vehicle',
      HttpStatus.BAD_REQUEST,
    );
  }

  async removeUserFromVehicle(
    vehicleId: string,
    userId: string,
  ): Promise<void> {
    const updatedVehicle = await this.vehicleModel
      .findOneAndUpdate({ _id: vehicleId }, { $pull: { users: { userId } } })
      .exec();

    if (!updatedVehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }
  }
}
