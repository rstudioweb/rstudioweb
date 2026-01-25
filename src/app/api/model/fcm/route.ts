import { NextRequest, NextResponse } from 'next/server';
import { updateModel } from '@/domain/model';

/**
 * Update FCM token for a model
 * POST /api/model/fcm
 * Body: { modelId: string, fcmToken: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelId, fcmToken } = body || {};

    if (!modelId || typeof modelId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'modelId is required' },
        { status: 400 }
      );
    }

    if (!fcmToken || typeof fcmToken !== 'string') {
      return NextResponse.json(
        { success: false, error: 'fcmToken is required' },
        { status: 400 }
      );
    }

    const result = await updateModel(modelId, { fcmToken });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to update FCM token' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
