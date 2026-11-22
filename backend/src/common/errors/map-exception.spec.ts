import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { mapException } from './map-exception';

const clientError = (
  status: number,
  error: string,
  message: string | string[],
) => ({
  status,
  body: { statusCode: status, message, error },
  unexpected: false,
});

const databaseError = (properties: object) =>
  Object.assign(new Error('database error'), properties);

const duplicateKeyError = (keyPattern?: Record<string, number>) =>
  databaseError({ code: 11000, keyPattern });

describe('mapException', () => {
  describe('HTTP exceptions', () => {
    it('keeps the message of an exception created with a message', () => {
      expect(
        mapException(
          new HttpException('Vehicle not found', HttpStatus.NOT_FOUND),
        ),
      ).toEqual({
        status: 404,
        body: { statusCode: 404, message: 'Vehicle not found' },
        unexpected: false,
      });
    });

    it('keeps the body of a Nest exception', () => {
      expect(mapException(new NotFoundException('Event not found'))).toEqual(
        clientError(404, 'Not Found', 'Event not found'),
      );
    });

    it('keeps the list of messages of a validation error', () => {
      expect(
        mapException(new BadRequestException(['email must be an email'])),
      ).toEqual(clientError(400, 'Bad Request', ['email must be an email']));
    });
  });

  describe('duplicate keys', () => {
    it('maps a duplicated plate to 409 with a clear message', () => {
      expect(mapException(duplicateKeyError({ plate: 1 }))).toEqual(
        clientError(
          409,
          'Conflict',
          'A vehicle with this plate already exists',
        ),
      );
    });

    it.each<[string, Record<string, number> | undefined]>([
      ['another field', { email: 1 }],
      ['no key pattern', undefined],
    ])('maps a duplicate with %s to a generic 409', (_label, keyPattern) => {
      expect(mapException(duplicateKeyError(keyPattern))).toEqual(
        clientError(
          409,
          'Conflict',
          'A record with the same unique value already exists',
        ),
      );
    });
  });

  describe('cast errors', () => {
    it('names the invalid field', () => {
      const error = databaseError({ name: 'CastError', path: 'vehicleId' });

      expect(mapException(error)).toEqual(
        clientError(400, 'Bad Request', 'Invalid value for vehicleId'),
      );
    });

    it.each<[string, unknown]>([
      ['no path', undefined],
      ['a path that is not a string', 42],
    ])('uses a generic message with %s', (_label, path) => {
      const error = databaseError({ name: 'CastError', path });

      expect(mapException(error)).toEqual(
        clientError(400, 'Bad Request', 'Invalid value in the request'),
      );
    });
  });

  describe('Mongoose validation errors', () => {
    it('lists the message of every invalid field', () => {
      const error = databaseError({
        name: 'ValidationError',
        errors: {
          name: { message: 'Path `name` is required.' },
          model: { message: 'Path `model` is required.' },
        },
      });

      expect(mapException(error)).toEqual(
        clientError(400, 'Bad Request', [
          'Path `name` is required.',
          'Path `model` is required.',
        ]),
      );
    });

    it('uses a generic message for a field without a text message', () => {
      const error = databaseError({
        name: 'ValidationError',
        errors: {
          name: {},
          model: { message: 'Path `model` is required.' },
        },
      });

      expect(mapException(error)).toEqual(
        clientError(400, 'Bad Request', [
          'Invalid value',
          'Path `model` is required.',
        ]),
      );
    });

    it.each<[string, object | undefined]>([
      ['no details', undefined],
      ['an empty list of details', {}],
    ])('reports a generic failure with %s', (_label, errors) => {
      const error = databaseError({ name: 'ValidationError', errors });

      expect(mapException(error)).toEqual(
        clientError(400, 'Bad Request', 'Validation failed'),
      );
    });
  });

  describe('unexpected errors', () => {
    it.each<[string, unknown]>([
      ['an Error', new Error('connection lost')],
      ['a string', 'boom'],
      ['null', null],
      ['undefined', undefined],
    ])('maps %s to a generic 500 that must be logged', (_label, exception) => {
      expect(mapException(exception)).toEqual({
        status: 500,
        body: { statusCode: 500, message: 'Internal server error' },
        unexpected: true,
      });
    });

    it('does not map an error with a code that is not a duplicate key', () => {
      const error = databaseError({ code: 'auth/user-not-found' });

      expect(mapException(error).status).toBe(500);
    });

    it('does not expose the message of the error', () => {
      const { body } = mapException(new Error('password=secret'));

      expect(JSON.stringify(body)).not.toContain('secret');
    });
  });
});
