import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { validationPipeOptions } from '../validation-pipe-options';

const pipe = new ValidationPipe(validationPipeOptions);

export function validateBody<T extends object>(
  metatype: new () => T,
  payload: object,
): Promise<T> {
  return pipe.transform(payload, { type: 'body', metatype }) as Promise<T>;
}

export async function validationMessages<T extends object>(
  metatype: new () => T,
  payload: object,
): Promise<string[]> {
  const error: unknown = await validateBody(metatype, payload).then(
    () => undefined,
    (reason: unknown) => reason,
  );

  if (!(error instanceof BadRequestException)) {
    throw new Error('Expected the payload to be rejected with a 400 error');
  }

  const { message } = error.getResponse() as { message: string | string[] };

  return Array.isArray(message) ? message : [message];
}
