import { getDb } from '@/lib/firebase';
import { DPR, DPRResponse } from './types';

/**
 * Firestore-based DPR Services
 * Replaces Google Sheets implementation
 */

export async function fetchAllDPR(): Promise<DPRResponse> {
  try {
    const db = getDb();
    const snapshot = await db.collection('dpr').get();

    if (snapshot.empty) {
      return { success: true, data: [] };
    }

    const dprs: DPR[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        modelId: data.modelId || '',
        date: data.date || '',
        dtarget: Number(data.dtarget) || 0,
        dachv: Number(data.dachv) || 0,
        ddue: Number(data.ddue) || 0,
        createdAt: data.createdAt || '',
      };
    });

    return { success: true, data: dprs };
  } catch (error) {
    console.error('Error fetching DPR from Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function addDPR(dpr: DPR): Promise<DPRResponse> {
  try {
    const db = getDb();
    const dprRef = db.collection('dpr');
    
    const docId = `${dpr.modelId}_${dpr.date}`;
    const ddue = dpr.ddue || dpr.dtarget - dpr.dachv;

    await dprRef.doc(docId).set({
      modelId: dpr.modelId,
      date: dpr.date,
      dtarget: dpr.dtarget,
      dachv: dpr.dachv,
      ddue,
      createdAt: new Date().toISOString(),
    });

    return { success: true, data: { ...dpr, ddue, createdAt: new Date().toISOString() } };
  } catch (error) {
    console.error('Error adding DPR to Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateDPR(
  modelId: string,
  date: string,
  updates: Partial<DPR>
): Promise<DPRResponse> {
  try {
    const db = getDb();
    const docId = `${modelId}_${date}`;
    const dprRef = db.collection('dpr').doc(docId);

    const doc = await dprRef.get();
    if (!doc.exists) {
      return { success: false, error: 'DPR record not found' };
    }

    const currentData = doc.data();
    const dtarget = updates.dtarget !== undefined ? updates.dtarget : currentData?.dtarget || 0;
    const dachv = updates.dachv !== undefined ? updates.dachv : currentData?.dachv || 0;
    const ddue = updates.ddue !== undefined ? updates.ddue : dtarget - dachv;

    await dprRef.update({
      dtarget,
      dachv,
      ddue,
    });

    const updatedDPR: DPR = {
      modelId,
      date,
      dtarget,
      dachv,
      ddue,
      createdAt: currentData?.createdAt || '',
    };

    return { success: true, data: updatedDPR };
  } catch (error) {
    console.error('Error updating DPR in Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteDPR(
  modelId: string,
  date: string
): Promise<DPRResponse> {
  try {
    const db = getDb();
    const docId = `${modelId}_${date}`;
    const dprRef = db.collection('dpr').doc(docId);

    const doc = await dprRef.get();
    if (!doc.exists) {
      return { success: false, error: 'DPR record not found' };
    }

    await dprRef.delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting DPR from Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
