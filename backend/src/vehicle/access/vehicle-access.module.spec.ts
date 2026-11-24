import { MODULE_METADATA } from '@nestjs/common/constants';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleAccessModule } from './vehicle-access.module';
import { VehicleAccessService } from './vehicle-access.service';

const metadata = (key: string): unknown =>
  Reflect.getMetadata(key, VehicleAccessModule);

describe('VehicleAccessModule', () => {
  it('imports the Mongoose feature module of the Vehicle model', () => {
    expect(metadata(MODULE_METADATA.IMPORTS)).toEqual([
      expect.objectContaining({ module: MongooseModule }),
    ]);
  });

  it('provides VehicleAccessService', () => {
    expect(metadata(MODULE_METADATA.PROVIDERS)).toEqual([VehicleAccessService]);
  });

  it('exports VehicleAccessService', () => {
    expect(metadata(MODULE_METADATA.EXPORTS)).toEqual([VehicleAccessService]);
  });
});
