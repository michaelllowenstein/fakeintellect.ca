import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

let firebaseApp: admin.app.App | null = null;

export function getFirebaseApp(): admin.app.App {
  if (!firebaseApp) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccount) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON env var is required');
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    logger.info('Firebase Admin initialized');
  }
  return firebaseApp;
}

export const getRealtimeDb = (): admin.database.Database => {
  return getFirebaseApp().database();
}

// ── Post stats helpers (realtime counters) ────────────────────────────────────

export async function incrementPostView(postId: string): Promise<void> {
  const db = getRealtimeDb();
  const ref = db.ref(`post_stats/${postId}/viewCount`);
  await ref.transaction((current: number) => (current || 0) + 1);
}

export async function incrementPostLike(postId: string): Promise<void> {
  const db = getRealtimeDb();
  const ref = db.ref(`post_stats/${postId}/likeCount`);
  await ref.transaction((current: number) => (current || 0) + 1);
}

export async function syncPostStats(
  postId: string,
  stats: { viewCount: number; likeCount: number; commentCount: number },
): Promise<void> {
  const db = getRealtimeDb();
  await db.ref(`post_stats/${postId}`).update({
    viewCount: stats.viewCount,
    likeCount: stats.likeCount,
    commentCount: stats.commentCount,
    lastSyncedAt: Date.now(),
  });
}

export async function trackActiveReader(
  postId: string,
  sessionId: string,
): Promise<void> {
  const db = getRealtimeDb();
  const ref = db.ref(`active_readers/${postId}/${sessionId}`);
  await ref.set({
    connectedAt: Date.now(),
    // Firebase onDisconnect auto-removes when client disconnects
  });
  await ref.onDisconnect().remove();
}
