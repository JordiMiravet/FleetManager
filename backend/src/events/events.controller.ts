import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('events')
@UseGuards(FirebaseAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@CurrentUser('uid') userId: string) {
    return this.eventsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('uid') userId: string) {
    return this.eventsService.findOne(id, userId);
  }

  @Post()
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser('uid') userId: string,
  ) {
    return this.eventsService.create(createEventDto, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser('uid') userId: string,
  ) {
    return this.eventsService.update(id, updateEventDto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('uid') userId: string) {
    await this.eventsService.delete(id, userId);
    return { message: 'Event deleted successfully' };
  }
}
