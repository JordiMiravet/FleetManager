import { BadRequestException } from '@nestjs/common';
import { ParseMongoIdPipe } from './parse-mongo-id.pipe';

describe('ParseMongoIdPipe', () => {
  const pipe = new ParseMongoIdPipe();

  it('returns a valid Mongo id unchanged', () => {
    expect(pipe.transform('507f1f77bcf86cd799439011')).toBe(
      '507f1f77bcf86cd799439011',
    );
  });

  it.each([
    'abc',
    'zzzzzzzzzzzzzzzzzzzzzzzz',
    '123456789012',
    '507f1f77bcf86cd79943901',
    '',
  ])('rejects the invalid id "%s"', (id) => {
    expect(() => pipe.transform(id)).toThrow(BadRequestException);
  });
});
