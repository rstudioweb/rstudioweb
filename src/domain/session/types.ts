export interface ModelSession {
  loginAt: string; // ISO timestamp
  logoutAt?: string | null; // ISO timestamp or null
  deviceId?: string; // Device fingerprint
  deviceName?: string; // Device display name (e.g., "Chrome on Windows")
}

export interface ModelDailySessions {
  modelId: string;
  date: string; // YYYY-MM-DD (local date)
  sessions: ModelSession[];
  totalSeconds: number; // aggregated seconds for the day
}

export interface SessionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}