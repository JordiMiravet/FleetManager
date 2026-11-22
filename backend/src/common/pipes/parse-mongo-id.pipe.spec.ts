import { BadRequestException } from '@nestjs/common';
import { ParseMongoIdPipe } from './parse-mongo-id.pipe';

describe('ParseMongoIdPipe', () => {
  const pipe = new ParseMongoIdPipe();

  describe('transform', () => {
    describe('with a valid id', () => {
      it.each([
        ['lowercase', '507f1f77bcf86cd799439011'],
        ['uppercase', '507F1F77BCF86CD799439011'],
      ])('returns a %s id unchanged', (_label, id) => {
        expect(pipe.transform(id)).toBe(id);
      });
    });

    describe('with an invalid id', () => {
      it.each([
        ['an empty string', ''],
        ['text that is not hexadecimal', 'abc'],
        ['24 characters that are not hexadecimal', 'zzzzzzzzzzzzzzzzzzzzzzzz'],
        ['12 characters', '123456789012'],
        ['23 hexadecimal characters', '507f1f77bcf86cd79943901'],
      ])('rejects %s', (_label, id) => {
        expect(() => pipe.transform(id)).toThrow(BadRequestException);
      });

      it.each<[string, unknown]>([
        ['undefined', undefined],
        ['null', null],
        ['a number', 507],
      ])('rejects %s', (_label, value) => {
        expect(() => pipe.transform(value as string)).toThrow(
          BadRequestException,
        );
      });

      it('explains that the id is not valid', () => {
        expect(() => pipe.transform('abc')).toThrow('The id is not valid');
      });
    });
  });
});
