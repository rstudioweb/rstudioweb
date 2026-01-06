/**
 * Monthly Performance Report (MPR) Types
 */

export interface MPR {
  id?: string;
  modelId: string;
  month: string;
  mtgt: number;
  machv: number;
  mdue: number;
  remaindays: number;
  wkof: number;
  createdAt?: string;
}

export interface MPRResponse {
  success: boolean;
  data?: MPR | MPR[];
  error?: string;
}
