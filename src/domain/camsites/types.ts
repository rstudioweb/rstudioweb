export interface CamSite {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  modelId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CamSitesResponse {
  success: boolean;
  data?: CamSite[];
  error?: string;
}

export interface CamSiteResponse {
  success: boolean;
  data?: CamSite;
  error?: string;
}
