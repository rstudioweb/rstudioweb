import { NextRequest, NextResponse } from 'next/server';
import { updateModelProfile } from '@/domain/model';

/**
 * API Route: POST /api/model/update
 * Updates a model row in Google Sheets (service account required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, updates } = (body as { modelId?: string; updates?: unknown }) || {};

    if (!modelId) {
      return NextResponse.json(
        { success: false, error: 'Model ID is required' },
        { status: 400 },
      );
    }

    const updatePayload = (updates || {}) as Record<string, unknown>;
    const result = await updateModelProfile(modelId, updatePayload);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/model/update:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
