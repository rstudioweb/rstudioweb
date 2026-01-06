/**
 * Daily Performance Report Types
 */

export interface DPR {
  modelId: string;
  date: string; // YYYY-MM-DD
  dtarget: number;
  dachv: number;
  ddue?: number; // calculated: dtarget - dachv
  createdAt?: string;
}

export interface DPRResponse {
  success: boolean;
  data?: DPR | DPR[];
  error?: string;
}
