import { NextRequest, NextResponse } from 'next/server';
import { fetchAllModels } from '@/domain/model';

/**
 * API Route: POST /api/model
 * Fetches model profile data from Firestore
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

    // Fetch all models and find the one with matching id
    const result = await fetchAllModels();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    const model = result.data?.find(m => m.id === modelId);
    
    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Model not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: model },
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
