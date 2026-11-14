import { HttpException, HttpStatus } from '@nestjs/common';

export interface MappedException {
  status: number;
  body: string | object;
  unexpected: boolean;
}

interface DatabaseError {
  name?: unknown;
  code?: unknown;
  keyPattern?: Record<string, unknown>;
  path?: unknown;
  errors?: Record<string, { message?: unknown }>;
}

const DUPLICATE_KEY_CODE = 11000;

function toDatabaseError(exception: unknown): DatabaseError {
  return typeof exception === 'object' && exception !== null
    ? (exception as DatabaseError)
    : {};
}

function clientError(
  status: HttpStatus,
  error: string,
  message: string | string[],
): MappedException {
  return {
    status,
    body: { statusCode: status, message, error },
    unexpected: false,
  };
}

function mapHttpException(exception: HttpException): MappedException {
  const status = exception.getStatus();
  const response = exception.getResponse();

  return {
    status,
    body:
      typeof response === 'string'
        ? { statusCode: status, message: response }
        : response,
    unexpected: false,
  };
}

export function mapException(exception: unknown): MappedException {
  if (exception instanceof HttpException) {
    return mapHttpException(exception);
  }

  const error = toDatabaseError(exception);

  if (error.code === DUPLICATE_KEY_CODE) {
    const duplicatedField = Object.keys(error.keyPattern ?? {})[0];

    return clientError(
      HttpStatus.CONFLICT,
      'Conflict',
      duplicatedField === 'plate'
        ? 'A vehicle with this plate already exists'
        : 'A record with the same unique value already exists',
    );
  }

  if (error.name === 'CastError') {
    return clientError(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      typeof error.path === 'string'
        ? `Invalid value for ${error.path}`
        : 'Invalid value in the request',
    );
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors ?? {}).map((item) =>
      typeof item.message === 'string' ? item.message : 'Invalid value',
    );

    return clientError(
      HttpStatus.BAD_REQUEST,
      'Bad Request',
      messages.length > 0 ? messages : 'Validation failed',
    );
  }

  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    },
    unexpected: true,
  };
}
