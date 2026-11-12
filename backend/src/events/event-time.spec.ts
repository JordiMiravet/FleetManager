import { BadRequestException } from '@nestjs/common';
import { assertValidTimeRange, parseTimeToMinutes } from './event-time';

describe('parseTimeToMinutes', () => {
  it.each([
    ['00:00', 0],
    ['09:30', 570],
    ['23:59', 1439],
  ])('converts %s to %i minutes', (time, minutes) => {
    expect(parseTimeToMinutes(time)).toBe(minutes);
  });

  it.each(['9:00', '24:00', '12:60', '12:00:00', 'noon', ''])(
    'rejects the invalid time "%s"',
    (time) => {
      expect(() => parseTimeToMinutes(time)).toThrow(BadRequestException);
    },
  );
});

describe('assertValidTimeRange', () => {
  it('accepts an end time after the start time', () => {
    expect(() => assertValidTimeRange('09:00', '10:00')).not.toThrow();
  });

  it('rejects an end time equal to the start time', () => {
    expect(() => assertValidTimeRange('09:00', '09:00')).toThrow(
      'The end time must be after the start time',
    );
  });

  it('rejects an end time before the start time', () => {
    expect(() => assertValidTimeRange('10:00', '09:00')).toThrow(
      'The end time must be after the start time',
    );
  });

  it('rejects an invalid time', () => {
    expect(() => assertValidTimeRange('9:00', '10:00')).toThrow(
      BadRequestException,
    );
  });
});
