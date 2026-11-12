import { BadRequestException } from '@nestjs/common';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseTimeToMinutes(time: string): number {
  const match = TIME_PATTERN.exec(time);

  if (!match) {
    throw new BadRequestException(`Invalid time "${time}". Expected HH:mm`);
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

export function assertValidTimeRange(hourStart: string, hourEnd: string): void {
  if (parseTimeToMinutes(hourEnd) <= parseTimeToMinutes(hourStart)) {
    throw new BadRequestException('The end time must be after the start time');
  }
}
