import { IsNumber, Max, Min } from 'class-validator';

export class LocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  // The longitude has no range: the map repeats the world horizontally, so a
  // marker dragged across its edge produces values beyond +-180.
  @IsNumber()
  lng: number;
}
