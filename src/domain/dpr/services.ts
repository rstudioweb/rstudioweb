import { google } from 'googleapis';
import { DPR, DPRResponse } from './types';

const DPR_SHEET_RANGE = process.env.GOOGLE_DPR_SHEET_RANGE || 'Dpr!A1:S100';

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

const getDPRSheetName = (): string => {
  if (DPR_SHEET_RANGE.includes('!')) return DPR_SHEET_RANGE.split('!')[0];
  return 'Dpr';
};

export async function fetchAllDPR(): Promise<DPRResponse> {
  try {
    if (!hasServiceAccountConfig()) {
      return { success: false, error: 'Service account not configured' };
    }

    const { sheets, spreadsheetId } = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: DPR_SHEET_RANGE,
    });

    const values = (response.data.values as any[][]) || [];
    if (!values.length) return { success: true, data: [] };

    const [headersRow = [], ...dataRows] = values;
    const headers = headersRow.map((h) => String(h || '').toLowerCase());

    const dprs: DPR[] = dataRows.map((row) => {
      const entry: Record<string, any> = {};
      headers.forEach((h, idx) => {
        entry[h] = row[idx];
      });
      return {
        modelId: String(entry.modelid || ''),
        date: String(entry.date || ''),
        dtarget: Number(entry.dtarget || 0),
        dachv: Number(entry.dachv || 0),
        ddue: Number(entry.ddue || Number(entry.dtarget || 0) - Number(entry.dachv || 0)),
        createdAt: String(entry.createdat || ''),
      };
    });

    return { success: true, data: dprs };
  } catch (error) {
    console.error('Error fetching DPR:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function addDPR(dpr: DPR): Promise<DPRResponse> {
  try {
    if (!hasServiceAccountConfig()) {
      return { success: false, error: 'Service account not configured' };
    }

    const { sheets, spreadsheetId } = getSheetsClient();
    const sheetName = getDPRSheetName();

    const ddue = dpr.ddue || dpr.dtarget - dpr.dachv;
    const rowData = [
      dpr.modelId,
      dpr.date,
      dpr.dtarget,
      dpr.dachv,
      ddue,
      new Date().toISOString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:F`,
      valueInputOption: 'RAW',
      requestBody: { values: [rowData] },
    });

    return { success: true, data: { ...dpr, ddue, createdAt: new Date().toISOString() } };
  } catch (error) {
    console.error('Error adding DPR:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateDPR(
  modelId: string,
  date: string,
  updates: Partial<DPR>,
): Promise<DPRResponse> {
  try {
    if (!hasServiceAccountConfig()) {
      return { success: false, error: 'Service account not configured' };
    }

    const { sheets, spreadsheetId } = getSheetsClient();
    const sheetName = getDPRSheetName();

    // Fetch all DPR to find the row to update
    const allDPRResponse = await fetchAllDPR();
    if (!allDPRResponse.success || !Array.isArray(allDPRResponse.data)) {
      return { success: false, error: 'Failed to fetch existing DPR data' };
    }

    const dprs = allDPRResponse.data;
    const rowIndex = dprs.findIndex((d) => d.modelId === modelId && d.date === date);

    if (rowIndex === -1) {
      return { success: false, error: 'DPR record not found' };
    }

    // Get the response to find the actual row number in the sheet (add 2 for header + index)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: DPR_SHEET_RANGE,
    });

    const values = (response.data.values as any[][]) || [];
    const [headersRow = [], ...dataRows] = values;
    const headers = headersRow.map((h) => String(h || '').toLowerCase());

    // Find the actual row in the sheet
    let actualRowNum = -1;
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const entry: Record<string, any> = {};
      headers.forEach((h, idx) => {
        entry[h] = row[idx];
      });
      if (String(entry.modelid) === modelId && String(entry.date) === date) {
        actualRowNum = i + 2; // +2 for header row and 1-based indexing
        break;
      }
    }

    if (actualRowNum === -1) {
      return { success: false, error: 'DPR record not found in sheet' };
    }

    // Prepare update values
    const dtarget = updates.dtarget !== undefined ? updates.dtarget : dprs[rowIndex].dtarget;
    const dachv = updates.dachv !== undefined ? updates.dachv : dprs[rowIndex].dachv;
    const ddue = updates.ddue !== undefined ? updates.ddue : dtarget - dachv;

    const updateData = [
      [modelId, date, dtarget, dachv, ddue],
    ];

    // Update the row in the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${actualRowNum}:E${actualRowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values: updateData },
    });

    const updatedDPR: DPR = {
      modelId,
      date,
      dtarget,
      dachv,
      ddue,
      createdAt: dprs[rowIndex].createdAt,
    };

    return { success: true, data: updatedDPR };
  } catch (error) {
    console.error('Error updating DPR:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
