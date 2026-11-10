import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { VehicleAccessModule } from './access/vehicle-access.module';
import { EventsModule } from '../events/events.module';
import { VehicleSharingService } from './vehicle-sharing.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }]),
    VehicleAccessModule,
    EventsModule,
  ],
  controllers: [VehicleController],
  providers: [VehicleService, VehicleSharingService],
})
export class VehicleModule {}
