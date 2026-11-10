import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { EnvironmentVariables } from '../../config/environment-variables';

@Injectable()
export class FirebaseService {
  private readonly app: admin.app.App;

  constructor(configService: ConfigService<EnvironmentVariables, true>) {
    this.app = admin.apps.length
      ? admin.app()
      : admin.initializeApp({
          credential: admin.credential.cert({
            projectId: configService.get('FIREBASE_PROJECT_ID', {
              infer: true,
            }),
            clientEmail: configService.get('FIREBASE_CLIENT_EMAIL', {
              infer: true,
            }),
            privateKey: configService
              .get('FIREBASE_PRIVATE_KEY', { infer: true })
              .replace(/\\n/g, '\n'),
          }),
        });
  }

  verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return this.app.auth().verifyIdToken(token);
  }

  getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    return this.app.auth().getUserByEmail(email);
  }
}
