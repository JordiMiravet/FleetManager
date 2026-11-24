import { BadRequestException } from '@nestjs/common';
import {
  assertValidTimeRange,
  DATE_PATTERN,
  parseTimeToMinutes,
  TIME_PATTERN,
} from './event-time';

const INVALID_TIMES = ['9:00', '24:00', '12:60', '12:00:00', 'noon', ''];

describe('event-time', () => {
  describe('DATE_PATTERN', () => {
    it.each(['2026-11-10', '1999-01-01'])('accepts "%s"', (date) => {
      expect(DATE_PATTERN.test(date)).toBe(true);
    });

    it.each(['2026-1-5', '10/11/2026', '2026-11-10T09:00', ' 2026-11-10', ''])(
      'rejects "%s"',
      (date) => {
        expect(DATE_PATTERN.test(date)).toBe(false);
      },
    );
  });

  describe('TIME_PATTERN', () => {
    it.each(['00:00', '09:30', '23:59'])('accepts "%s"', (time) => {
      expect(TIME_PATTERN.test(time)).toBe(true);
    });

    it.each(INVALID_TIMES)('rejects "%s"', (time) => {
      expect(TIME_PATTERN.test(time)).toBe(false);
    });
  });

  describe('parseTimeToMinutes', () => {
    it.each([
      ['00:00', 0],
      ['00:01', 1],
      ['09:30', 570],
      ['12:00', 720],
      ['23:59', 1439],
    ])('converts %s to %i minutes', (time, minutes) => {
      expect(parseTimeToMinutes(time)).toBe(minutes);
    });

    it.each(INVALID_TIMES)('rejects the invalid time "%s"', (time) => {
      expect(() => parseTimeToMinutes(time)).toThrow(BadRequestException);
    });

    it('names the invalid time in the error', () => {
      expect(() => parseTimeToMinutes('9:00')).toThrow(
        'Invalid time "9:00". Expected HH:mm',
      );
    });
  });

  describe('assertValidTimeRange', () => {
    it.each([
      ['09:00', '10:00'],
      ['09:00', '09:01'],
      ['00:00', '23:59'],
    ])('accepts the range %s - %s', (start, end) => {
      expect(() => assertValidTimeRange(start, end)).not.toThrow();
    });

    it.each([
      ['an end time equal to the start time', '09:00', '09:00'],
      ['an end time before the start time', '10:00', '09:00'],
      ['a range that crosses midnight', '23:59', '00:00'],
    ])('rejects %s', (_label, start, end) => {
      expect(() => assertValidTimeRange(start, end)).toThrow(
        'The end time must be after the start time',
      );
    });

    it.each([
      ['start', '9:00', '10:00'],
      ['end', '09:00', '25:00'],
    ])('rejects an invalid %s time', (_label, start, end) => {
      expect(() => assertValidTimeRange(start, end)).toThrow(
        BadRequestException,
      );
    });
  });
});
