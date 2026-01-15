export interface AccountApproval {
  id?: string;
  modelId: string;
  modelName: string;
  approvedAccounts: string[]; // Array of approved account names: SM, LJ, BJ, CS, XC, IL
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountApprovalResponse {
  success: boolean;
  data?: AccountApproval;
  error?: string;
}

export interface FetchApprovalResponse {
  success: boolean;
  data?: AccountApproval;
  error?: string;
}
