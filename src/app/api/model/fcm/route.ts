import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
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

    // Primary: update by document id
    const result = await updateModel(modelId, { fcmToken });

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    }

    // Fallback: update by stored `id` field (for legacy docs where docId != modelId)
    const db = getDb();
    const snap = await db.collection('models').where('id', '==', modelId).limit(1).get();

    if (snap.empty) {
      return NextResponse.json(
        { success: false, error: result.error || 'Model not found for token update' },
        { status: 404 }
      );
    }

    const docRef = snap.docs[0].ref;
    await docRef.update({ fcmToken, updatedAt: new Date().toISOString() });
    const updated = await docRef.get();

    return NextResponse.json({ success: true, data: { id: docRef.id, ...updated.data() } });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
