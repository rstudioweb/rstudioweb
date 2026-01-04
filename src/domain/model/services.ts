/**
 * Model Profile Services
 * Handles Google Sheets integration and data fetching
 */

import { google } from 'googleapis';

import { ModelProfile, FetchModelResponse, GoogleSheetRow } from './types';

type SheetRow = Record<string, string | number | undefined>;

const SHEET_RANGE = process.env.GOOGLE_SHEETS_RANGE || 'Models!A1:Z';

const hasServiceAccountConfig = () =>
  Boolean(
    process.env.GOOGLE_SHEETS_SA_CLIENT_EMAIL &&
      process.env.GOOGLE_SHEETS_SA_PRIVATE_KEY &&
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  );

const getSheetsClient = () => {
  const clientEmail = process.env.GOOGLE_SHEETS_SA_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_SA_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error('Google Sheets service account config missing');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  return { sheets, spreadsheetId };
};

const fetchRowsFromSheets = async (): Promise<SheetRow[]> => {
  const { sheets, spreadsheetId } = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: SHEET_RANGE,
  });

  type RowValues = Array<string | number>;

  const values = (response.data.values as RowValues[] | undefined) || [];
  if (!values.length) return [];

  const headersRow: RowValues = (values[0] || []) as RowValues;
  const dataRows: RowValues[] = values.slice(1) as RowValues[];

  const normalizedHeaders: string[] = headersRow.map((header) =>
    String(header ?? '').trim().toLowerCase(),
  );

  return dataRows.map((row) => {
    const entry: SheetRow = {};
    normalizedHeaders.forEach((key, idx) => {
      entry[key] = row[idx];
    });
    return entry;
  });
};

const asString = (value: string | number | undefined): string =>
  value == null ? '' : String(value);

const asNumber = (value: string | number | undefined): number => {
  if (value == null || value === '') return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const mapSheetRow = (row: SheetRow): GoogleSheetRow => ({
  id: asString(row.id),
  name: asString(row.name),
  email: asString(row.email),
  phone: asString(row.phone),
  location: asString(row.location),
  bio: asString(row.bio),
  profileImage: asString(row.profileimage),
  rating: asNumber(row.rating),
  totalBookings: asNumber(row.totalbookings),
  status: asString(row.status),
  createdAt: asString(row.createdat),
  updatedAt: asString(row.updatedat),
  instagram: asString(row.instagram),
  twitter: asString(row.twitter),
  portfolio: asString(row.portfolio),
  completedProjects: asNumber(row.completedprojects),
  activeProjects: asNumber(row.activeprojects),
  reviews: asNumber(row.reviews),
  earnings: asNumber(row.earnings),
});

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
    if (hasServiceAccountConfig()) {
      const rows = await fetchRowsFromSheets();
      const match = rows.find(
        (row) => String(row.id || '').toLowerCase() === modelId.toLowerCase(),
      );

      if (!match) {
        return { success: false, error: 'Model not found in sheet' };
      }

      const profile = transformSheetRowToProfile(mapSheetRow(match));
      return { success: true, data: profile };
    }

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
    if (hasServiceAccountConfig()) {
      const rows = await fetchRowsFromSheets();
      const profiles = rows.map((row) => transformSheetRowToProfile(mapSheetRow(row)));
      return { success: true, data: profiles };
    }

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
