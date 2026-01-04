/**
 * Model Profile Services
 * Handles Google Sheets integration and data fetching
 */

import { ModelProfile, FetchModelResponse, GoogleSheetRow } from './types';

/**
 * Fetch model profile from Google Sheets
 * You'll need to:
 * 1. Set up a Google Apps Script web app that returns JSON
 * 2. Set environment variable GOOGLE_SHEET_APP_SCRIPT_URL
 * 3. Share the Google Sheet with the service account
 */
export async function fetchModelProfile(
  modelId: string
): Promise<FetchModelResponse> {
  try {
    const scriptUrl = process.env.GOOGLE_SHEET_APP_SCRIPT_URL;
    
    if (!scriptUrl) {
      return {
        success: false,
        error: 'Google Sheet integration not configured',
      };
    }

    // Call Google Apps Script web app
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getModel',
        modelId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch model: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Unknown error',
      };
    }

    return {
      success: true,
      data: data.model,
    };
  } catch (error) {
    console.error('Error fetching model profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch all models from Google Sheets
 */
export async function fetchAllModels(): Promise<FetchModelResponse> {
  try {
    const scriptUrl = process.env.GOOGLE_SHEET_APP_SCRIPT_URL;
    
    if (!scriptUrl) {
      return {
        success: false,
        error: 'Google Sheet integration not configured',
      };
    }

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getAllModels',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Unknown error',
      };
    }

    return {
      success: true,
      data: data.models,
    };
  } catch (error) {
    console.error('Error fetching all models:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Transform Google Sheet row to ModelProfile
 */
export function transformSheetRowToProfile(row: GoogleSheetRow): ModelProfile {
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    email: String(row.email || ''),
    phone: String(row.phone || ''),
    location: String(row.location || ''),
    bio: String(row.bio || ''),
    profileImage: String(row.profileImage || ''),
    rating: Number(row.rating || 0),
    totalBookings: Number(row.totalBookings || 0),
    status: (row.status as 'active' | 'inactive' | 'pending') || 'pending',
    createdAt: String(row.createdAt || new Date().toISOString()),
    updatedAt: String(row.updatedAt || new Date().toISOString()),
    socialLinks: {
      instagram: String(row.instagram || ''),
      twitter: String(row.twitter || ''),
      portfolio: String(row.portfolio || ''),
    },
    stats: {
      completedProjects: Number(row.completedProjects || 0),
      activeProjects: Number(row.activeProjects || 0),
      reviews: Number(row.reviews || 0),
      earnings: Number(row.earnings || 0),
    },
  };
}
