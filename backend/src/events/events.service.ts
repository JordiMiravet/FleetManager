import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Event } from './schemas/event.schema';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { assertValidTimeRange } from './event-time';

import { Vehicle } from '../vehicle/schemas/vehicle.schema';
import { VehicleAccessService } from '../vehicle/access/vehicle-access.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private readonly vehicleAccessService: VehicleAccessService,
  ) {}

  async findAll(userId: string): Promise<Event[]> {
    const vehicleIds =
      await this.vehicleAccessService.findAccessibleVehicleIds(userId);

    return this.eventModel
      .find({
        vehicleId: { $in: vehicleIds },
      })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Event> {
    const vehicleIds =
      await this.vehicleAccessService.findAccessibleVehicleIds(userId);

    const event = await this.eventModel
      .findOne({
        _id: id,
        vehicleId: { $in: vehicleIds },
      })
      .exec();

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
    await this.findAccessibleVehicleOrFail(createEventDto.vehicleId, userId);

    assertValidTimeRange(createEventDto.hourStart, createEventDto.hourEnd);

    await this.assertNoOverlap(
      createEventDto.vehicleId,
      createEventDto.date,
      createEventDto.hourStart,
      createEventDto.hourEnd,
    );

    const newEvent = new this.eventModel({
      ...createEventDto,
      userId,
    });

    return newEvent.save();
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
  ): Promise<Event> {
    const event = await this.findEventOfAccessibleVehicle(id, userId);

    await this.validateSchedulingChanges(id, event, updateEventDto, userId);

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();

    if (!updatedEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return updatedEvent;
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findEventOfAccessibleVehicle(id, userId);

    const result = await this.eventModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }

  async deleteByVehicle(vehicleId: string): Promise<void> {
    await this.eventModel.deleteMany({ vehicleId }).exec();
  }

  private async findAccessibleVehicleOrFail(
    vehicleId: string,
    userId: string,
  ): Promise<Vehicle> {
    const vehicle = await this.vehicleAccessService.findAccessibleVehicle(
      vehicleId,
      userId,
    );

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  private async assertNoOverlap(
    vehicleId: string,
    date: string,
    hourStart: string,
    hourEnd: string,
    excludedEventId?: string,
  ): Promise<void> {
    const overlappingEvent = await this.eventModel
      .exists({
        vehicleId,
        date,
        hourStart: { $lt: hourEnd },
        hourEnd: { $gt: hourStart },
        ...(excludedEventId ? { _id: { $ne: excludedEventId } } : {}),
      })
      .exec();

    if (overlappingEvent) {
      throw new ConflictException(
        'The vehicle already has an event in that time range',
      );
    }
  }

  private async findEventOfAccessibleVehicle(
    id: string,
    userId: string,
  ): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const vehicle = await this.vehicleAccessService.findAccessibleVehicle(
      event.vehicleId,
      userId,
    );

    if (!vehicle) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  private async validateSchedulingChanges(
    id: string,
    event: Event,
    changes: UpdateEventDto,
    userId: string,
  ): Promise<void> {
    const vehicleId = changes.vehicleId ?? event.vehicleId;
    const date = changes.date ?? event.date;
    const hourStart = changes.hourStart ?? event.hourStart;
    const hourEnd = changes.hourEnd ?? event.hourEnd;

    const movesToAnotherVehicle = vehicleId !== event.vehicleId;
    const schedulingChanged =
      movesToAnotherVehicle ||
      date !== event.date ||
      hourStart !== event.hourStart ||
      hourEnd !== event.hourEnd;

    if (movesToAnotherVehicle) {
      await this.findAccessibleVehicleOrFail(vehicleId, userId);
    }

    if (!schedulingChanged) {
      return;
    }

    assertValidTimeRange(hourStart, hourEnd);
    await this.assertNoOverlap(vehicleId, date, hourStart, hourEnd, id);
  }
}
