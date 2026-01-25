/**
 * Model Profile Domain Types
 * Defines interfaces for model/worker profile data
 */

export interface ModelProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  profileImage: string;
  rating: number;
  totalBookings: number;
  status: 'active' | 'inactive' | 'pending';
  username?: string;
  password?: string;
  fcmToken?: string;
  createdAt: string;
  updatedAt: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    portfolio?: string;
  };
  stats?: {
    completedProjects: number;
    activeProjects: number;
    reviews: number;
    earnings: number;
  };
}

export interface GoogleSheetRow {
  [key: string]: string | number | boolean | undefined;
}

export interface FetchModelResponse {
  success: boolean;
  data?: ModelProfile | ModelProfile[];
  error?: string;
}
