import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  const response = { isResponse: true };
  const request = { method: 'POST', url: '/vehicles' };

  let reply: jest.Mock;
  let errorSpy: jest.SpyInstance;
  let filter: AllExceptionsFilter;
  let host: ArgumentsHost;

  beforeEach(() => {
    reply = jest.fn();
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    filter = new AllExceptionsFilter({
      httpAdapter: { reply },
    } as unknown as HttpAdapterHost);
    host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('replies with the status and the body of an HTTP exception without logging it', () => {
    filter.catch(
      new HttpException('Vehicle not found', HttpStatus.NOT_FOUND),
      host,
    );

    expect(reply).toHaveBeenCalledWith(
      response,
      { statusCode: 404, message: 'Vehicle not found' },
      404,
    );
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('maps a duplicated plate to 409 without logging it as an error', () => {
    const error = Object.assign(new Error('E11000 duplicate key error'), {
      code: 11000,
      keyPattern: { plate: 1 },
    });

    filter.catch(error, host);

    expect(reply).toHaveBeenCalledWith(
      response,
      {
        statusCode: 409,
        message: 'A vehicle with this plate already exists',
        error: 'Conflict',
      },
      409,
    );
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('replies with a generic 500 error and logs the failure with its stack', () => {
    const error = new Error('connection lost');

    filter.catch(error, host);

    expect(reply).toHaveBeenCalledWith(
      response,
      { statusCode: 500, message: 'Internal server error' },
      500,
    );
    expect(errorSpy).toHaveBeenCalledWith(
      'POST /vehicles failed: connection lost',
      error.stack,
    );
  });

  it('logs a thrown value that is not an Error', () => {
    filter.catch('boom', host);

    expect(reply).toHaveBeenCalledWith(
      response,
      { statusCode: 500, message: 'Internal server error' },
      500,
    );
    expect(errorSpy).toHaveBeenCalledWith(
      'POST /vehicles failed: boom',
      undefined,
    );
  });
});
