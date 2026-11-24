import { GLOBAL_MODULE_METADATA } from '@nestjs/common/constants';
import { FirebaseModule } from './firebase.module';
import { FirebaseService } from './firebase.service';

// @nestjs/config is an ES module that Jest cannot load in this CommonJS setup.
jest.mock('./firebase.service', () => ({
  FirebaseService: class FirebaseService {},
}));

describe('FirebaseModule', () => {
  it('is a global module', () => {
    expect(Reflect.getMetadata(GLOBAL_MODULE_METADATA, FirebaseModule)).toBe(
      true,
    );
  });

  it('provides FirebaseService', () => {
    expect(Reflect.getMetadata('providers', FirebaseModule)).toEqual([
      FirebaseService,
    ]);
  });

  it('exports FirebaseService', () => {
    expect(Reflect.getMetadata('exports', FirebaseModule)).toEqual([
      FirebaseService,
    ]);
  });
});
