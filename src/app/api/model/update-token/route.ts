import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const { modelId, deviceToken } = await req.json();

    if (!modelId || !deviceToken) {
      return NextResponse.json(
        { success: false, error: 'Missing modelId or deviceToken' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Update the model document with deviceToken
    await db.collection('models').doc(modelId).update({
      deviceToken: deviceToken,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Device token stored successfully',
    });
  } catch (error) {
    console.error('POST /api/model/update-token error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
