import { validateEnvironment } from './validate-environment';

const validEnvironment = {
  MONGO_URI: 'mongodb://localhost:27017/fleetmanager',
  FIREBASE_PROJECT_ID: 'project-id',
  FIREBASE_CLIENT_EMAIL: 'client@example.com',
  FIREBASE_PRIVATE_KEY: 'private-key',
};

describe('validateEnvironment', () => {
  it('accepts a valid environment and applies the defaults', () => {
    const result = validateEnvironment(validEnvironment);

    expect(result.MONGO_URI).toBe(validEnvironment.MONGO_URI);
    expect(result.PORT).toBe(3000);
    expect(result.CORS_ORIGIN).toBe('http://localhost:4200');
  });

  it('converts PORT to a number', () => {
    const result = validateEnvironment({ ...validEnvironment, PORT: '4000' });

    expect(result.PORT).toBe(4000);
  });

  it('uses the provided CORS origin', () => {
    const result = validateEnvironment({
      ...validEnvironment,
      CORS_ORIGIN: 'https://fleetmanager.example.com',
    });

    expect(result.CORS_ORIGIN).toBe('https://fleetmanager.example.com');
  });

  it.each([
    'MONGO_URI',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ])('throws when %s is missing', (variable) => {
    const environment: Record<string, unknown> = { ...validEnvironment };
    delete environment[variable];

    expect(() => validateEnvironment(environment)).toThrow(variable);
  });

  it('throws when PORT is not a valid port', () => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, PORT: 'abc' }),
    ).toThrow('PORT');
  });

  it('throws when CORS_ORIGIN is empty', () => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, CORS_ORIGIN: '' }),
    ).toThrow('CORS_ORIGIN');
  });
});
