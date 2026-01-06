import { NextRequest, NextResponse } from 'next/server';
import { fetchAllModels } from '@/domain/model';

/**
 * API Route: GET /api/model/list
 * Lists all models
 */
export async function GET() {
  try {
    const result = await fetchAllModels();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in /api/model/list:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
