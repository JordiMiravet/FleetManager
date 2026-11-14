import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { mapException } from './map-exception';

describe('mapException', () => {
  describe('HTTP exceptions', () => {
    it('keeps the body of an exception created with a message', () => {
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
      expect(mapException(new NotFoundException('Event not found'))).toEqual({
        status: 404,
        body: {
          statusCode: 404,
          message: 'Event not found',
          error: 'Not Found',
        },
        unexpected: false,
      });
    });

    it('keeps the list of messages of a validation error', () => {
      expect(
        mapException(new BadRequestException(['email must be an email'])),
      ).toEqual({
        status: 400,
        body: {
          statusCode: 400,
          message: ['email must be an email'],
          error: 'Bad Request',
        },
        unexpected: false,
      });
    });
  });

  describe('duplicate keys', () => {
    function duplicateKeyError(keyPattern: Record<string, number>) {
      return Object.assign(new Error('E11000 duplicate key error'), {
        code: 11000,
        keyPattern,
      });
    }

    it('maps a duplicated plate to 409 with a clear message', () => {
      expect(mapException(duplicateKeyError({ plate: 1 }))).toEqual({
        status: 409,
        body: {
          statusCode: 409,
          message: 'A vehicle with this plate already exists',
          error: 'Conflict',
        },
        unexpected: false,
      });
    });

    it('maps any other duplicated value to 409 with a generic message', () => {
      expect(mapException(duplicateKeyError({ email: 1 }))).toEqual({
        status: 409,
        body: {
          statusCode: 409,
          message: 'A record with the same unique value already exists',
          error: 'Conflict',
        },
        unexpected: false,
      });
    });
  });

  describe('invalid values', () => {
    it('maps a cast error to 400 naming the invalid field', () => {
      const error = Object.assign(new Error('Cast to ObjectId failed'), {
        name: 'CastError',
        path: 'vehicleId',
      });

      expect(mapException(error)).toEqual({
        status: 400,
        body: {
          statusCode: 400,
          message: 'Invalid value for vehicleId',
          error: 'Bad Request',
        },
        unexpected: false,
      });
    });

    it('maps a cast error without field to 400', () => {
      const error = Object.assign(new Error('Cast failed'), {
        name: 'CastError',
      });

      expect(mapException(error).body).toEqual({
        statusCode: 400,
        message: 'Invalid value in the request',
        error: 'Bad Request',
      });
    });

    it('maps a Mongoose validation error to 400 with its messages', () => {
      const error = Object.assign(new Error('Validation failed'), {
        name: 'ValidationError',
        errors: {
          name: { message: 'Path `name` is required.' },
          model: { message: 'Path `model` is required.' },
        },
      });

      expect(mapException(error)).toEqual({
        status: 400,
        body: {
          statusCode: 400,
          message: ['Path `name` is required.', 'Path `model` is required.'],
          error: 'Bad Request',
        },
        unexpected: false,
      });
    });

    it('maps a Mongoose validation error without details to 400', () => {
      const error = Object.assign(new Error('failed'), {
        name: 'ValidationError',
      });

      expect(mapException(error).body).toEqual({
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request',
      });
    });
  });

  describe('unexpected errors', () => {
    it.each([new Error('connection lost'), 'boom', null, undefined])(
      'maps %p to a generic 500 error that must be logged',
      (exception) => {
        expect(mapException(exception)).toEqual({
          status: 500,
          body: { statusCode: 500, message: 'Internal server error' },
          unexpected: true,
        });
      },
    );

    it('does not map an error whose code is not a duplicate key', () => {
      const error = Object.assign(new Error('no user'), {
        code: 'auth/user-not-found',
      });

      expect(mapException(error).status).toBe(500);
    });

    it('does not expose the message of the error', () => {
      const result = mapException(new Error('password=secret'));

      expect(JSON.stringify(result.body)).not.toContain('secret');
    });
  });
});
