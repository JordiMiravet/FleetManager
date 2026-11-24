import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions.filter';

const response = { isResponse: true };

const INTERNAL_ERROR_BODY = {
  statusCode: 500,
  message: 'Internal server error',
};

const createHost = (request: object): ArgumentsHost =>
  ({
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  }) as unknown as ArgumentsHost;

describe('AllExceptionsFilter', () => {
  let reply: jest.Mock;
  let errorSpy: jest.SpyInstance;
  let filter: AllExceptionsFilter;

  const handle = (
    exception: unknown,
    request: object = { method: 'POST', url: '/vehicles' },
  ) => {
    filter.catch(exception, createHost(request));
  };

  beforeEach(() => {
    reply = jest.fn();
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    filter = new AllExceptionsFilter({
      httpAdapter: { reply },
    } as unknown as HttpAdapterHost);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('catch', () => {
    describe('with an HTTP exception', () => {
      beforeEach(() => {
        handle(new HttpException('Vehicle not found', HttpStatus.NOT_FOUND));
      });

      it('replies with its status and body', () => {
        expect(reply).toHaveBeenCalledWith(
          response,
          { statusCode: 404, message: 'Vehicle not found' },
          404,
        );
      });

      it('does not log it', () => {
        expect(errorSpy).not.toHaveBeenCalled();
      });
    });

    describe('with a database error', () => {
      beforeEach(() => {
        handle(
          Object.assign(new Error('E11000 duplicate key error'), {
            code: 11000,
            keyPattern: { plate: 1 },
          }),
        );
      });

      it('maps a duplicated plate to 409', () => {
        expect(reply).toHaveBeenCalledWith(
          response,
          {
            statusCode: 409,
            message: 'A vehicle with this plate already exists',
            error: 'Conflict',
          },
          409,
        );
      });

      it('does not log it as an error', () => {
        expect(errorSpy).not.toHaveBeenCalled();
      });
    });

    describe('with an unexpected error', () => {
      it.each<[string, unknown]>([
        ['an Error', new Error('connection lost')],
        ['a value that is not an Error', 'boom'],
      ])('replies with a generic 500 for %s', (_label, exception) => {
        handle(exception);

        expect(reply).toHaveBeenCalledWith(response, INTERNAL_ERROR_BODY, 500);
      });

      it('logs the failure with the request, the message and the stack', () => {
        const error = new Error('connection lost');

        handle(error);

        expect(errorSpy).toHaveBeenCalledWith(
          'POST /vehicles failed: connection lost',
          error.stack,
        );
      });

      it('logs a value that is not an Error without a stack', () => {
        handle('boom');

        expect(errorSpy).toHaveBeenCalledWith(
          'POST /vehicles failed: boom',
          undefined,
        );
      });

      it.each<[string, object, string]>([
        ['method', { url: '/vehicles' }, ' /vehicles failed: connection lost'],
        ['url', { method: 'POST' }, 'POST  failed: connection lost'],
        ['method and url', {}, '  failed: connection lost'],
      ])(
        'logs the failure when the request has no %s',
        (_label, request, expected) => {
          handle(new Error('connection lost'), request);

          expect(errorSpy).toHaveBeenCalledWith(expected, expect.any(String));
        },
      );
    });
  });
});
