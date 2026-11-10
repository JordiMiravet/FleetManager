import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle } from '../schemas/vehicle.schema';

@Injectable()
export class VehicleAccessService {
  constructor(
    @InjectModel(Vehicle.name) private readonly vehicleModel: Model<Vehicle>,
  ) {}

  buildAccessFilter(userId: string) {
    return { $or: [{ userId }, { 'users.userId': userId }] };
  }

  findAccessibleVehicles(userId: string): Promise<Vehicle[]> {
    return this.vehicleModel.find(this.buildAccessFilter(userId)).exec();
  }

  findAccessibleVehicle(
    vehicleId: string,
    userId: string,
  ): Promise<Vehicle | null> {
    return this.vehicleModel
      .findOne({ _id: vehicleId, ...this.buildAccessFilter(userId) })
      .exec();
  }

  async findAccessibleVehicleIds(userId: string): Promise<string[]> {
    const vehicles = await this.vehicleModel
      .find(this.buildAccessFilter(userId))
      .select('_id')
      .exec();

    return vehicles.map((vehicle) => vehicle._id.toString());
  }

  isOwner(vehicle: Vehicle, userId: string): boolean {
    return vehicle.userId === userId;
  }
}
