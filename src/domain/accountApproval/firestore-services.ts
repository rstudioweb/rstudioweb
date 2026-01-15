import { getDb } from '@/lib/firebase';
import { AccountApproval, FetchApprovalResponse, AccountApprovalResponse } from './types';

/**
 * Firestore-based Account Approval Services
 */

export async function fetchAccountApprovalByModelId(
  modelId: string
): Promise<FetchApprovalResponse> {
  try {
    const db = getDb();
    const snapshot = await db.collection('accountApprovals').where('modelId', '==', modelId).limit(1).get();

    if (snapshot.empty) {
      return { success: true, data: undefined };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    const approval: AccountApproval = {
      id: doc.id,
      modelId: data.modelId,
      modelName: data.modelName,
      approvedAccounts: data.approvedAccounts || [],
      createdAt: data.createdAt || '',
      updatedAt: data.updatedAt || '',
    };

    return { success: true, data: approval };
  } catch (error) {
    console.error('Error fetching account approval from Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function saveAccountApproval(
  modelId: string,
  modelName: string,
  accounts: {
    SM?: boolean;
    LJ?: boolean;
    BJ?: boolean;
    CS?: boolean;
    XC?: boolean;
    IL?: boolean;
  }
): Promise<AccountApprovalResponse> {
  try {
    const db = getDb();
    const approvalsRef = db.collection('accountApprovals');

    // Filter only approved accounts (where value is true)
    const approvedAccounts = Object.keys(accounts)
      .filter((key) => accounts[key as keyof typeof accounts] === true)
      .sort();

    // Check if approval already exists for this model
    const docRef = approvalsRef.doc(modelId);
    const existingDoc = await docRef.get();

    if (existingDoc.exists) {
      // Update existing record
      await docRef.update({
        approvedAccounts,
        updatedAt: new Date().toISOString(),
      });

      const updatedDoc = await docRef.get();
      const data = updatedDoc.data();

      const approval: AccountApproval = {
        id: updatedDoc.id,
        modelId: data?.modelId,
        modelName: data?.modelName,
        approvedAccounts: data?.approvedAccounts || [],
        createdAt: data?.createdAt,
        updatedAt: data?.updatedAt,
      };

      return { success: true, data: approval };
    } else {
      // Create new record with modelId as document ID
      await docRef.set({
        modelId,
        modelName,
        approvedAccounts,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const newApproval: AccountApproval = {
        id: modelId,
        modelId,
        modelName,
        approvedAccounts,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { success: true, data: newApproval };
    }
  } catch (error) {
    console.error('Error saving account approval to Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteAccountApproval(modelId: string): Promise<AccountApprovalResponse> {
  try {
    const db = getDb();
    const approvalsRef = db.collection('accountApprovals');

    const snapshot = await approvalsRef.where('modelId', '==', modelId).limit(1).get();

    if (!snapshot.empty) {
      const docId = snapshot.docs[0].id;
      await approvalsRef.doc(docId).delete();
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting account approval from Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
