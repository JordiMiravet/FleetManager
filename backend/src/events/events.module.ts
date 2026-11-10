import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event, EventSchema } from './schemas/event.schema';
import { VehicleAccessModule } from '../vehicle/access/vehicle-access.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    VehicleAccessModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
