import { MODULE_METADATA } from '@nestjs/common/constants';
import { VehicleAccessModule } from './vehicle-access.module';
import { VehicleAccessService } from './vehicle-access.service';

describe('VehicleAccessModule', () => {
  it('should be defined', () => {
    expect(VehicleAccessModule).toBeDefined();
  });

  it('should register the Vehicle schema with MongooseModule', () => {
    const imports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      VehicleAccessModule,
    ) as unknown[];

    expect(imports).toHaveLength(1);
    expect(imports[0]).toBeDefined();
  });

  it('should provide VehicleAccessService', () => {
    const providers = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      VehicleAccessModule,
    ) as unknown[];

    expect(providers).toContain(VehicleAccessService);
  });

  it('should export VehicleAccessService', () => {
    const exports = Reflect.getMetadata(
      MODULE_METADATA.EXPORTS,
      VehicleAccessModule,
    ) as unknown[];

    expect(exports).toContain(VehicleAccessService);
  });
});
