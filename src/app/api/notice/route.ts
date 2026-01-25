import admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelIds, all, message, imageUrl, title } = body || {};

    if (!message || !String(message).trim()) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    initializeFirebase();
    const db = admin.firestore();

    // Collect tokens (supports legacy docs where docId != modelId and legacy deviceToken field)
    let tokens: string[] = [];

    if (all) {
      const snap = await db.collection('models').get();
      tokens = snap.docs
        .map((doc) => {
          const d = doc.data() || {};
          return (d.fcmToken as string | undefined) || (d.deviceToken as string | undefined);
        })
        .filter((t): t is string => Boolean(t));
    } else if (Array.isArray(modelIds) && modelIds.length > 0) {
      // First try direct doc lookup; then fallback to querying by stored id field
      const directDocs = await Promise.all(
        modelIds.map((id: string) => db.collection('models').doc(id).get())
      );

      const missingIds = modelIds.filter((_, idx) => !directDocs[idx]?.exists);

      const fallbackDocs = missingIds.length
        ? (
            await Promise.all(
              missingIds.map(async (id: string) => {
                const snap = await db.collection('models').where('id', '==', id).limit(1).get();
                return snap.empty ? null : snap.docs[0];
              })
            )
          ).filter(Boolean)
        : [];

      tokens = [...directDocs, ...fallbackDocs]
        .map((doc) => {
          const d = doc?.data() || {};
          return (d.fcmToken as string | undefined) || (d.deviceToken as string | undefined);
        })
        .filter((t): t is string => Boolean(t));
    } else {
      return NextResponse.json({ success: false, error: 'Provide modelIds or set all=true' }, { status: 400 });
    }

    // Deduplicate tokens
    tokens = Array.from(new Set(tokens));

    if (tokens.length === 0) {
      return NextResponse.json({ success: false, error: 'No FCM tokens found for selection' }, { status: 400 });
    }

    const messaging = admin.messaging();

    const payload: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: title || 'Notice',
        body: message,
        ...(imageUrl ? { imageUrl } : {}),
      },
      data: {
        message,
        ...(imageUrl ? { imageUrl } : {}),
      },
      android: imageUrl
        ? { notification: { imageUrl } }
        : undefined,
      apns: imageUrl
        ? { fcmOptions: { image: imageUrl } as admin.messaging.ApnsFcmOptions }
        : undefined,
    };

    const resp = await messaging.sendEachForMulticast(payload);

    return NextResponse.json({
      success: true,
      sent: resp.successCount,
      failed: resp.failureCount,
      errors: resp.responses
        .map((r, idx) => (!r.success ? { index: idx, error: r.error?.message } : null))
        .filter(Boolean),
    });
  } catch (error) {
    console.error('Error sending notice:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
