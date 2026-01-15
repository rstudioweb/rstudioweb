import { getDb } from '@/lib/firebase';
import { CamSite, CamSitesResponse, CamSiteResponse } from './types';

const COLLECTION = 'camsites';

// Default sample sites
const SAMPLE_SITES = [
  { name: 'SC', status: 'ACTIVE' as const },
  { name: 'LJ', status: 'ACTIVE' as const },
  { name: 'BJ', status: 'INACTIVE' as const },
  { name: 'CS', status: 'ACTIVE' as const },
];

export async function initializeSampleCamSites(modelId: string): Promise<void> {
  try {
    const db = getDb();
    const existingSnapshot = await db
      .collection(COLLECTION)
      .where('modelId', '==', modelId)
      .get();

    // Only initialize if no sites exist for this model
    if (existingSnapshot.empty) {
      const now = new Date().toISOString();

      for (const sample of SAMPLE_SITES) {
        await db.collection(COLLECTION).add({
          name: sample.name,
          status: sample.status,
          modelId,
          createdAt: now,
          updatedAt: now,
        });
      }

      console.log(`Initialized ${SAMPLE_SITES.length} sample camera sites for model ${modelId}`);
    }
  } catch (error) {
    console.error('initializeSampleCamSites error:', error);
  }
}

export async function getCamSitesByModel(modelId: string): Promise<CamSitesResponse> {
  try {
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTION)
      .where('modelId', '==', modelId)
      .get();

    if (snapshot.empty) {
      // Initialize sample sites if none exist
      await initializeSampleCamSites(modelId);
      
      // Fetch again after initialization
      const newSnapshot = await db
        .collection(COLLECTION)
        .where('modelId', '==', modelId)
        .get();

      const sites: CamSite[] = newSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as CamSite))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return { success: true, data: sites };
    }

    const sites: CamSite[] = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as CamSite))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, data: sites };
  } catch (error) {
    console.error('getCamSitesByModel error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function addCamSite(
  modelId: string,
  name: string,
  status: 'ACTIVE' | 'INACTIVE'
): Promise<CamSiteResponse> {
  try {
    const db = getDb();
    const now = new Date().toISOString();

    const payload: CamSite = {
      id: '',
      name,
      status,
      modelId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(COLLECTION).add(payload);
    return {
      success: true,
      data: { ...payload, id: docRef.id },
    };
  } catch (error) {
    console.error('addCamSite error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateCamSiteStatus(
  siteId: string,
  status: 'ACTIVE' | 'INACTIVE'
): Promise<CamSiteResponse> {
  try {
    const db = getDb();
    const now = new Date().toISOString();

    await db.collection(COLLECTION).doc(siteId).update({
      status,
      updatedAt: now,
    });

    const doc = await db.collection(COLLECTION).doc(siteId).get();
    return {
      success: true,
      data: { id: doc.id, ...doc.data() } as CamSite,
    };
  } catch (error) {
    console.error('updateCamSiteStatus error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

