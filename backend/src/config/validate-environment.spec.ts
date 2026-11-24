import { EnvironmentVariables } from './environment-variables';
import { validateEnvironment } from './validate-environment';

const validEnvironment: Record<string, string> = {
  MONGO_URI: 'mongodb://localhost:27017/fleetmanager',
  FIREBASE_PROJECT_ID: 'project-id',
  FIREBASE_CLIENT_EMAIL: 'client@example.com',
  FIREBASE_PRIVATE_KEY: 'private-key',
};

const REQUIRED_VARIABLES = Object.keys(validEnvironment);

const without = (variable: string) =>
  Object.fromEntries(
    Object.entries(validEnvironment).filter(([key]) => key !== variable),
  );

const validationError = (environment: Record<string, unknown>): string => {
  try {
    validateEnvironment(environment);
  } catch (error) {
    return (error as Error).message;
  }

  return '';
};

describe('validateEnvironment', () => {
  describe('with a valid environment', () => {
    it('returns an EnvironmentVariables instance with the given values', () => {
      const result = validateEnvironment(validEnvironment);

      expect(result).toBeInstanceOf(EnvironmentVariables);
      expect(result).toMatchObject(validEnvironment);
    });

    it('applies the defaults of the optional variables', () => {
      const result = validateEnvironment(validEnvironment);

      expect(result.PORT).toBe(3000);
      expect(result.CORS_ORIGIN).toBe('http://localhost:4200');
    });

    it('ignores variables that are not part of the schema', () => {
      expect(() =>
        validateEnvironment({ ...validEnvironment, UNRELATED: 'value' }),
      ).not.toThrow();
    });
  });

  describe('PORT', () => {
    it.each([
      ['4000', 4000],
      ['1', 1],
      ['65535', 65535],
    ])('converts "%s" to the number %i', (port, expected) => {
      expect(
        validateEnvironment({ ...validEnvironment, PORT: port }).PORT,
      ).toBe(expected);
    });

    it.each(['abc', '0', '-1', '65536', '3000.5'])('rejects "%s"', (port) => {
      expect(validationError({ ...validEnvironment, PORT: port })).toContain(
        'PORT',
      );
    });
  });

  describe('CORS_ORIGIN', () => {
    it('uses the provided origin', () => {
      const result = validateEnvironment({
        ...validEnvironment,
        CORS_ORIGIN: 'https://fleetmanager.example.com',
      });

      expect(result.CORS_ORIGIN).toBe('https://fleetmanager.example.com');
    });

    it('rejects an empty origin', () => {
      expect(
        validationError({ ...validEnvironment, CORS_ORIGIN: '' }),
      ).toContain('CORS_ORIGIN');
    });
  });

  describe('required variables', () => {
    it.each(REQUIRED_VARIABLES)('rejects a missing %s', (variable) => {
      expect(validationError(without(variable))).toContain(variable);
    });

    it.each(REQUIRED_VARIABLES)('rejects an empty %s', (variable) => {
      expect(
        validationError({ ...validEnvironment, [variable]: '' }),
      ).toContain(variable);
    });

    it('reports every invalid variable at once', () => {
      const message = validationError({});

      REQUIRED_VARIABLES.forEach((variable) => {
        expect(message).toContain(variable);
      });
    });
  });
});
