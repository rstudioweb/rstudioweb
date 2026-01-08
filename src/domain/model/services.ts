/**
 * Model Profile Services
 * Handles Google Sheets integration and data fetching
 */

import { google } from 'googleapis';

import { ModelProfile, FetchModelResponse, GoogleSheetRow } from './types';

type SheetRow = Record<string, string | number | undefined>;

const SHEET_RANGE = process.env.GOOGLE_SHEETS_RANGE || 'Models!A1:Z';

const getSheetNameFromRange = (range: string): string => {
  if (range.includes('!')) return range.split('!')[0];
  return range || 'Models';
};

const columnLetterFromIndex = (index: number): string => {
  // 0 -> A, 25 -> Z, 26 -> AA
  let n = index;
  let letters = '';
  while (n >= 0) {
    letters = String.fromCharCode((n % 26) + 65) + letters;
    n = Math.floor(n / 26) - 1;
  }
  return letters;
};

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
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  return { sheets, spreadsheetId };
};

const fetchRowsWithHeaders = async (): Promise<{ headers: string[]; rows: SheetRow[] }> => {
  const { sheets, spreadsheetId } = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: SHEET_RANGE,
  });

  type RowValues = Array<string | number>;

  const values = (response.data.values as RowValues[] | undefined) || [];
  if (!values.length) return { headers: [], rows: [] };

  const headersRow: RowValues = (values[0] || []) as RowValues;
  const dataRows: RowValues[] = values.slice(1) as RowValues[];

  const normalizedHeaders: string[] = headersRow.map((header) =>
    String(header ?? '').trim().toLowerCase(),
  );

  const rows = dataRows.map((row) => {
    const entry: SheetRow = {};
    normalizedHeaders.forEach((key, idx) => {
      entry[key] = row[idx];
    });
    return entry;
  });

  return { headers: normalizedHeaders, rows };
};

const fetchRowsFromSheets = async (): Promise<SheetRow[]> => {
  const { rows } = await fetchRowsWithHeaders();
  return rows;
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
  username: asString(row.username),
  password: asString(row.password),
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

const modelToSheetFields = (updates: Partial<ModelProfile>): Partial<SheetRow> => ({
  id: updates.id,
  name: updates.name,
  email: updates.email,
  phone: updates.phone,
  location: updates.location,
  bio: updates.bio,
  profileimage: updates.profileImage,
  rating: updates.rating,
  totalbookings: updates.totalBookings,
  status: updates.status,
  username: updates.username,
  password: updates.password,
  createdat: updates.createdAt,
  updatedat: updates.updatedAt,
  instagram: updates.socialLinks?.instagram,
  twitter: updates.socialLinks?.twitter,
  portfolio: updates.socialLinks?.portfolio,
  completedprojects: updates.stats?.completedProjects,
  activeprojects: updates.stats?.activeProjects,
  reviews: updates.stats?.reviews,
  earnings: updates.stats?.earnings,
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

export async function updateModelProfile(
  modelId: string,
  updates: Partial<ModelProfile>,
): Promise<FetchModelResponse> {
  try {
    if (!hasServiceAccountConfig()) {
      return { success: false, error: 'Service account integration not configured' };
    }

    const { sheets, spreadsheetId } = getSheetsClient();
    const { headers, rows } = await fetchRowsWithHeaders();

    if (!headers.length) {
      return { success: false, error: 'No headers found in sheet' };
    }

    const matchIndex = rows.findIndex(
      (row) => String(row.id || '').toLowerCase() === modelId.toLowerCase(),
    );

    if (matchIndex === -1) {
      return { success: false, error: 'Model not found in sheet' };
    }

    const currentRow = rows[matchIndex];
    const mergedRow: SheetRow = {
      ...currentRow,
      ...modelToSheetFields(updates),
      updatedat: updates.updatedAt || new Date().toISOString(),
    };

    const sheetName = getSheetNameFromRange(SHEET_RANGE);
    const rowNumber = matchIndex + 2; // +1 for 1-indexed, +1 for header row
    const endColumnLetter = columnLetterFromIndex(headers.length - 1);
    const updateRange = `${sheetName}!A${rowNumber}:${endColumnLetter}${rowNumber}`;

    const rowValues = headers.map((headerKey) => mergedRow[headerKey] ?? '');

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: { values: [rowValues] },
    });

    const profile = transformSheetRowToProfile(mapSheetRow(mergedRow));
    return { success: true, data: profile };
  } catch (error) {
    console.error('Error updating model profile:', error);
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
    username: String(row.username || ''),
    password: String(row.password || ''),
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

/**
 * Add a new model to Google Sheets
 */
export async function addModel(
  model: Partial<ModelProfile>,
): Promise<{ success: boolean; data?: ModelProfile; error?: string }> {
  try {
    if (!hasServiceAccountConfig()) {
      return { success: false, error: 'Service account not configured' };
    }

    const { sheets, spreadsheetId } = getSheetsClient();
    const sheetName = getSheetNameFromRange(SHEET_RANGE);

    // Prepare row data matching the actual sheet column order:
    // id, name, phone, location, profileImage, username, password, status, createdAt, updatedAt
    const rowData = [
      model.id || '',
      model.name || '',
      model.phone || '',
      model.location || '',
      model.profileImage || '',
      model.username || '',
      model.password || '',
      model.status || 'pending',
      new Date().toISOString(), // createdAt
      new Date().toISOString(), // updatedAt
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:J`,
      valueInputOption: 'RAW',
      requestBody: { values: [rowData] },
    });

    const newModel: ModelProfile = {
      id: model.id || '',
      name: model.name || '',
      email: model.email || '',
      phone: model.phone || '',
      location: model.location || '',
      bio: model.bio || '',
      profileImage: model.profileImage || '',
      rating: model.rating || 0,
      totalBookings: model.totalBookings || 0,
      status: model.status || 'pending',
      username: model.username || '',
      password: model.password || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      socialLinks: { instagram: '', twitter: '', portfolio: '' },
      stats: { completedProjects: 0, activeProjects: 0, reviews: 0, earnings: 0 },
    };

    return { success: true, data: newModel };
  } catch (error) {
    console.error('Error adding model:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
