import type * as admin from 'firebase-admin';

export type AuthenticatedUser = admin.auth.DecodedIdToken;

export interface AuthenticatedRequest {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedUser;
}
