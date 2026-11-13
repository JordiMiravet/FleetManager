import {
  IsISO8601,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { DATE_PATTERN, TIME_PATTERN } from '../event-time';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @Matches(DATE_PATTERN, { message: 'date must be in YYYY-MM-DD format' })
  @IsISO8601(
    { strict: true },
    { message: 'date must be a valid calendar date' },
  )
  date: string;

  @Matches(TIME_PATTERN, { message: 'hourStart must be in HH:mm format' })
  hourStart: string;

  @Matches(TIME_PATTERN, { message: 'hourEnd must be in HH:mm format' })
  hourEnd: string;

  @IsMongoId()
  vehicleId: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
