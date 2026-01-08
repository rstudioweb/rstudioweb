import { getDb } from '@/lib/firebase';
import { ModelDailySessions, SessionResponse, ModelSession } from './types';

const COLLECTION = 'sessions';

function toSecondsDiff(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.floor((end - start) / 1000);
}

function computeTotalSeconds(sessions: ModelSession[]): number {
  return sessions.reduce((acc, s) => {
    if (s.loginAt && s.logoutAt) {
      return acc + toSecondsDiff(s.loginAt, s.logoutAt);
    }
    return acc;
  }, 0);
}

export async function addLoginSession(
  modelId: string,
  date: string,
  loginAt: string,
  deviceId?: string,
  deviceName?: string
): Promise<SessionResponse<ModelDailySessions>> {
  try {
    const db = getDb();
    const docId = `${modelId}_${date}`;
    const ref = db.collection(COLLECTION).doc(docId);
    const snap = await ref.get();

    if (!snap.exists) {
      const payload: ModelDailySessions = {
        modelId,
        date,
        sessions: [{ loginAt, logoutAt: null, deviceId, deviceName }],
        totalSeconds: 0,
      };
      await ref.set(payload);
      return { success: true, data: payload };
    } else {
      const data = snap.data() as ModelDailySessions;
      const sessions = Array.isArray(data.sessions) ? data.sessions : [];
      sessions.push({ loginAt, logoutAt: null, deviceId, deviceName });
      const totalSeconds = computeTotalSeconds(sessions);
      const updated: ModelDailySessions = { ...data, sessions, totalSeconds };
      await ref.set(updated, { merge: true });
      return { success: true, data: updated };
    }
  } catch (error) {
    console.error('addLoginSession error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function addLogoutSession(
  modelId: string,
  date: string,
  logoutAt: string,
  deviceId?: string
): Promise<SessionResponse<ModelDailySessions>> {
  try {
    const db = getDb();
    const docId = `${modelId}_${date}`;
    const ref = db.collection(COLLECTION).doc(docId);
    const snap = await ref.get();
    if (!snap.exists) {
      return { success: false, error: 'No session document for this date' };
    }
    const data = snap.data() as ModelDailySessions;
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];

    // Find last open session (no logoutAt) matching device if provided
    for (let i = sessions.length - 1; i >= 0; i--) {
      if (!sessions[i].logoutAt) {
        if (!deviceId || sessions[i].deviceId === deviceId) {
          sessions[i].logoutAt = logoutAt;
          break;
        }
      }
    }

    const totalSeconds = computeTotalSeconds(sessions);
    const updated: ModelDailySessions = { ...data, sessions, totalSeconds };
    await ref.set(updated, { merge: true });
    return { success: true, data: updated };
  } catch (error) {
    console.error('addLogoutSession error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function fetchDailySessions(
  modelId: string,
  date: string
): Promise<SessionResponse<ModelDailySessions | null>> {
  try {
    const db = getDb();
    const docId = `${modelId}_${date}`;
    const snap = await db.collection(COLLECTION).doc(docId).get();
    if (!snap.exists) return { success: true, data: null };
    return { success: true, data: snap.data() as ModelDailySessions };
  } catch (error) {
    console.error('fetchDailySessions error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
