import { NextRequest, NextResponse } from 'next/server';
import { fetchModelProfile } from '@/domain/model';

/**
 * API Route: POST /api/model
 * Fetches model profile data from Google Sheets via Apps Script
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 },
      );
    }

    const { modelId } = (body as { modelId?: string }) || {};

    if (!modelId) {
      return NextResponse.json(
        { success: false, error: 'Model ID is required' },
        { status: 400 }
      );
    }

    // Fetch from domain service (which calls Google Apps Script)
    const result = await fetchModelProfile(modelId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/model:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
