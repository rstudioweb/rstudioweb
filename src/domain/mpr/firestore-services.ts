import { getDb } from '@/lib/firebase';
import { MPR, MPRResponse } from './types';

/**
 * Firestore-based MPR Services
 * Replaces Google Sheets implementation
 */

export async function fetchAllMPR(): Promise<MPRResponse> {
  try {
    const db = getDb();
    const snapshot = await db.collection('mpr').get();

    if (snapshot.empty) {
      return { success: true, data: [] };
    }

    const mprs: MPR[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        modelId: data.modelId || '',
        month: data.month || '',
        mtgt: Number(data.mtgt) || 0,
        machv: Number(data.machv) || 0,
        mdue: Number(data.mdue) || 0,
        wkof: Number(data.wkof) || 0,
        remaindays: Number(data.remaindays) || 0,
      };
    });

    return { success: true, data: mprs };
  } catch (error) {
    console.error('Error fetching MPR from Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function addMPR(mpr: MPR): Promise<MPRResponse> {
  try {
    const db = getDb();
    const mprRef = db.collection('mpr');
    
    const docId = `${mpr.modelId}_${mpr.month}`;
    const mdue = mpr.mdue || mpr.mtgt - mpr.machv;

    await mprRef.doc(docId).set({
      modelId: mpr.modelId,
      month: mpr.month,
      mtgt: mpr.mtgt,
      machv: mpr.machv || 0,
      mdue,
      wkof: mpr.wkof || 0,
      remaindays: mpr.remaindays || 0,
    });

    return { success: true, data: { ...mpr, mdue } };
  } catch (error) {
    console.error('Error adding MPR to Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateMPR(
  modelId: string,
  month: string,
  updates: Partial<MPR>
): Promise<MPRResponse> {
  try {
    const db = getDb();
    const docId = `${modelId}_${month}`;
    const mprRef = db.collection('mpr').doc(docId);

    const doc = await mprRef.get();
    if (!doc.exists) {
      return { success: false, error: 'MPR record not found' };
    }

    const currentData = doc.data();
    const mtgt = updates.mtgt !== undefined ? updates.mtgt : currentData?.mtgt || 0;
    const machv = updates.machv !== undefined ? updates.machv : currentData?.machv || 0;
    const mdue = updates.mdue !== undefined ? updates.mdue : mtgt - machv;
    const wkof = updates.wkof !== undefined ? updates.wkof : currentData?.wkof || 0;
    const remaindays = updates.remaindays !== undefined ? updates.remaindays : currentData?.remaindays || 0;

    await mprRef.update({
      mtgt,
      machv,
      mdue,
      wkof,
      remaindays,
    });

    const updatedMPR: MPR = {
      modelId,
      month,
      mtgt,
      machv,
      mdue,
      wkof,
      remaindays,
    };

    return { success: true, data: updatedMPR };
  } catch (error) {
    console.error('Error updating MPR in Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
