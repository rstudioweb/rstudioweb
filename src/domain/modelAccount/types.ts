export interface ModelAccount {
  id?: string;
  modelId: string;
  email?: string;
  bio?: string;
  rating?: number;
  totalBookings?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModelAccountResponse {
  success: boolean;
  data?: ModelAccount;
  error?: string;
}

export interface FetchAccountResponse {
  success: boolean;
  data?: ModelAccount;
  error?: string;
}
