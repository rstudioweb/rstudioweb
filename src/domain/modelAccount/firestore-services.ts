import { getDb } from '@/lib/firebase';
import { ModelAccount, FetchAccountResponse, ModelAccountResponse } from './types';

/**
 * Firestore-based Model Account Services
 * Stores account details separately from model basic info
 */

export async function fetchAccountByModelId(
  modelId: string
): Promise<FetchAccountResponse> {
  try {
    const db = getDb();
    const snapshot = await db.collection('modelAccounts').where('modelId', '==', modelId).limit(1).get();

    if (snapshot.empty) {
      return { success: true, data: undefined };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    const account: ModelAccount = {
      id: doc.id,
      modelId: data.modelId,
      email: data.email || '',
      bio: data.bio || '',
      rating: Number(data.rating) || 0,
      totalBookings: Number(data.totalBookings) || 0,
      createdAt: data.createdAt || '',
      updatedAt: data.updatedAt || '',
    };

    return { success: true, data: account };
  } catch (error) {
    console.error('Error fetching model account from Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function saveModelAccount(
  modelId: string,
  account: Partial<Omit<ModelAccount, 'id' | 'modelId'>>
): Promise<ModelAccountResponse> {
  try {
    const db = getDb();
    const accountsRef = db.collection('modelAccounts');

    // Check if account already exists for this model
    const existingSnapshot = await accountsRef.where('modelId', '==', modelId).limit(1).get();

    if (!existingSnapshot.empty) {
      // Update existing record
      const docId = existingSnapshot.docs[0].id;
      await accountsRef.doc(docId).update({
        ...account,
        updatedAt: new Date().toISOString(),
      });

      const updatedDoc = await accountsRef.doc(docId).get();
      const data = updatedDoc.data();

      const updatedAccount: ModelAccount = {
        id: updatedDoc.id,
        modelId: data?.modelId,
        email: data?.email || '',
        bio: data?.bio || '',
        rating: Number(data?.rating) || 0,
        totalBookings: Number(data?.totalBookings) || 0,
        createdAt: data?.createdAt,
        updatedAt: data?.updatedAt,
      };

      return { success: true, data: updatedAccount };
    } else {
      // Create new record
      const docRef = await accountsRef.add({
        modelId,
        ...account,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const newAccount: ModelAccount = {
        id: docRef.id,
        modelId,
        ...account,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { success: true, data: newAccount };
    }
  } catch (error) {
    console.error('Error saving model account to Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteModelAccount(modelId: string): Promise<ModelAccountResponse> {
  try {
    const db = getDb();
    const accountsRef = db.collection('modelAccounts');

    const snapshot = await accountsRef.where('modelId', '==', modelId).limit(1).get();

    if (!snapshot.empty) {
      const docId = snapshot.docs[0].id;
      await accountsRef.doc(docId).delete();
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting model account from Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
