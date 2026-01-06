import { google } from 'googleapis';
import { MPR, MPRResponse } from './types';

const MPR_SHEET_RANGE = process.env.GOOGLE_MPR_SHEET_RANGE || 'Mpr!A1:S100';

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

const getMPRSheetName = (): string => {
  if (MPR_SHEET_RANGE.includes('!')) return MPR_SHEET_RANGE.split('!')[0];
  return 'Mpr';
};

export async function fetchAllMPR(): Promise<MPRResponse> {
  try {
    if (!hasServiceAccountConfig()) {
      return { success: false, error: 'Service account not configured' };
    }

    const { sheets, spreadsheetId } = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: MPR_SHEET_RANGE,
    });

    const values = (response.data.values as any[][]) || [];
    if (!values.length) return { success: true, data: [] };

    const [headersRow = [], ...dataRows] = values;
    const headers = headersRow.map((h) => String(h || '').toLowerCase());

    const mprs: MPR[] = dataRows.map((row) => {
      const entry: Record<string, any> = {};
      headers.forEach((h, idx) => {
        entry[h] = row[idx];
      });
      return {
        modelId: String(entry.modelid || ''),
        month: String(entry.month || ''),
        mtgt: Number(entry.mtgt || 0),
        machv: Number(entry.machv || 0),
        mdue: Number(entry.mdue || 0),
        remaindays: Number(entry.remaindays || 0),
        wkof: Number(entry.wkof || 0),
        createdAt: String(entry.createdat || ''),
      };
    });

    return { success: true, data: mprs };
  } catch (error) {
    console.error('Error fetching MPR:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function addMPR(mpr: MPR): Promise<MPRResponse> {
  try {
    if (!hasServiceAccountConfig()) {
      return { success: false, error: 'Service account not configured' };
    }

    const { sheets, spreadsheetId } = getSheetsClient();
    const sheetName = getMPRSheetName();

    // Match the actual sheet column order: modelId, month, mtgt, machv, mdue, remaindays, wkof, createdAt
    const rowData = [
      mpr.modelId,
      mpr.month,
      mpr.mtgt,
      mpr.machv,
      mpr.mdue,
      mpr.remaindays,
      mpr.wkof,
      new Date().toISOString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:H`,
      valueInputOption: 'RAW',
      requestBody: { values: [rowData] },
    });

    return { success: true, data: { ...mpr, createdAt: new Date().toISOString() } };
  } catch (error) {
    console.error('Error adding MPR:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateMPR(modelId: string, month: string, machv: number, mdue: number): Promise<MPRResponse> {
  try {
    if (!hasServiceAccountConfig()) {
      return { success: false, error: 'Service account not configured' };
    }

    const { sheets, spreadsheetId } = getSheetsClient();
    const sheetName = getMPRSheetName();

    // Fetch all data to find the row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: MPR_SHEET_RANGE,
    });

    const values = (response.data.values as any[][]) || [];
    if (values.length < 2) {
      return { success: false, error: 'No MPR records found' };
    }

    const [headersRow, ...dataRows] = values;
    const headers = headersRow.map((h) => String(h || '').toLowerCase());

    // Find the row index (add 2 because: 1 for header, 1 for 0-based to 1-based)
    const rowIndex = dataRows.findIndex((row) => {
      const entry: Record<string, any> = {};
      headers.forEach((h, idx) => {
        entry[h] = row[idx];
      });
      return String(entry.modelid || '').toLowerCase() === modelId.toLowerCase() && 
             String(entry.month || '').toLowerCase() === month.toLowerCase();
    });

    if (rowIndex === -1) {
      return { success: false, error: 'MPR record not found for this model and month' };
    }

    const actualRowNumber = rowIndex + 2; // +1 for header, +1 for 0-based to 1-based

    // Get column indices for machv and mdue
    const machvColIndex = headers.indexOf('machv');
    const mdueColIndex = headers.indexOf('mdue');

    if (machvColIndex === -1 || mdueColIndex === -1) {
      return { success: false, error: 'Column headers not found' };
    }

    // Convert column index to letter
    const machvCol = String.fromCharCode(65 + machvColIndex); // A=65
    const mdueCol = String.fromCharCode(65 + mdueColIndex);

    // Update machv
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!${machvCol}${actualRowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[machv]] },
    });

    // Update mdue
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!${mdueCol}${actualRowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[mdue]] },
    });

    return { success: true, data: { modelId, month, mtgt: 0, machv, mdue, remaindays: 0, wkof: 0 } };
  } catch (error) {
    console.error('Error updating MPR:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
