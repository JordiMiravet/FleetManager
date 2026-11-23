import { HttpException, HttpStatus } from '@nestjs/common';

export async function expectHttpError(
  promise: Promise<unknown>,
  status: HttpStatus,
  message: string,
): Promise<void> {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason,
  );

  expect(error).toBeInstanceOf(HttpException);
  expect((error as HttpException).getStatus()).toBe(status);
  expect((error as HttpException).message).toBe(message);
}
