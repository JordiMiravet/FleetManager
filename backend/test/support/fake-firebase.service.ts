import type * as admin from 'firebase-admin';

const TOKEN_PREFIX = 'test-token-';

/** Token that the fake accepts for a registered user. */
export const tokenFor = (uid: string): string => `${TOKEN_PREFIX}${uid}`;

/** Value for the `Authorization` header of a registered user. */
export const bearer = (uid: string): string => `Bearer ${tokenFor(uid)}`;

export interface FakeUser {
  uid: string;
  email: string;
}

/**
 * In-memory replacement for FirebaseService. The real FirebaseAuthGuard still
 * runs, so header parsing and 401 handling are exercised; only the call to
 * Firebase is replaced.
 */
export class FakeFirebaseService {
  private readonly users = new Map<string, FakeUser>();

  registerUser(user: FakeUser): void {
    this.users.set(user.uid, user);
  }

  verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    const uid = token.startsWith(TOKEN_PREFIX)
      ? token.slice(TOKEN_PREFIX.length)
      : undefined;
    const user = uid ? this.users.get(uid) : undefined;

    if (!user) {
      return Promise.reject(new Error('Invalid test token'));
    }

    return Promise.resolve({
      uid: user.uid,
      email: user.email,
    } as admin.auth.DecodedIdToken);
  }

  getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    const user = [...this.users.values()].find(
      (candidate) => candidate.email === email,
    );

    if (!user) {
      return Promise.reject(
        Object.assign(new Error('User not found'), {
          code: 'auth/user-not-found',
        }),
      );
    }

    return Promise.resolve({
      uid: user.uid,
      email: user.email,
    } as admin.auth.UserRecord);
  }
}
