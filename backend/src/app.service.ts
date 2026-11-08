import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

const CONNECTION_STATES: Record<number, string> = {
  0: 'Disconnected',
  1: 'Connected',
  2: 'Connecting',
  3: 'Disconnecting',
};

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async checkConnection(): Promise<string> {
    return CONNECTION_STATES[this.connection.readyState] ?? 'Unknown';
  }
}
