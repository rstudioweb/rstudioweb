import { getDb } from '@/lib/firebase';
import { ModelProfile, FetchModelResponse } from './types';

/**
 * Firestore-based Model Services
 * Replaces Google Sheets implementation
 */

export async function fetchAllModels(): Promise<FetchModelResponse> {
  try {
    const db = getDb();
    const snapshot = await db.collection('models').get();

    if (snapshot.empty) {
      return { success: true, data: [] };
    }

    const models: ModelProfile[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        bio: data.bio || '',
        profileImage: data.profileImage || '',
        rating: Number(data.rating) || 0,
        totalBookings: Number(data.totalBookings) || 0,
        username: data.username || '',
        password: data.password || '',
        status: data.status || 'active',
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
      };
    });

    return { success: true, data: models };
  } catch (error) {
    console.error('Error fetching models from Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function addModel(model: Omit<ModelProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<FetchModelResponse> {
  try {
    const db = getDb();
    const modelsRef = db.collection('models');
    
    // Extract account details
    const { email, bio, rating, totalBookings, ...modelFields } = model;
    
    const docRef = await modelsRef.add({
      name: modelFields.name || '',
      phone: modelFields.phone || '',
      location: modelFields.location || '',
      profileImage: modelFields.profileImage || '',
      username: modelFields.username || '',
      password: modelFields.password || '',
      status: modelFields.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Save account details separately if provided
    if (email || bio || rating || totalBookings) {
      try {
        const accountsRef = db.collection('modelAccounts');
        await accountsRef.add({
          modelId: docRef.id,
          email: email || '',
          bio: bio || '',
          rating: rating || 0,
          totalBookings: totalBookings || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error saving model account details:', err);
      }
    }

    const newModel: ModelProfile = {
      id: docRef.id,
      ...modelFields,
      email: email || '',
      bio: bio || '',
      rating: rating || 0,
      totalBookings: totalBookings || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { success: true, data: newModel };
  } catch (error) {
    console.error('Error adding model to Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateModel(
  id: string,
  updates: Partial<Omit<ModelProfile, 'id'>>
): Promise<FetchModelResponse> {
  try {
    const db = getDb();
    const modelRef = db.collection('models').doc(id);

    // Separate account details from model fields
    const { email, bio, rating, totalBookings, ...modelUpdates } = updates;

    // Update model fields
    await modelRef.update({
      ...modelUpdates,
      updatedAt: new Date().toISOString(),
    });

    // Update account details separately if provided
    if (email !== undefined || bio !== undefined || rating !== undefined || totalBookings !== undefined) {
      const accountsRef = db.collection('modelAccounts');
      const snapshot = await accountsRef.where('modelId', '==', id).limit(1).get();

      const accountData: any = {
        updatedAt: new Date().toISOString(),
      };
      
      if (email !== undefined) accountData.email = email;
      if (bio !== undefined) accountData.bio = bio;
      if (rating !== undefined) accountData.rating = rating;
      if (totalBookings !== undefined) accountData.totalBookings = totalBookings;

      if (!snapshot.empty) {
        // Update existing
        await accountsRef.doc(snapshot.docs[0].id).update(accountData);
      } else if (Object.keys(accountData).length > 1) {
        // Create new if account data provided
        await accountsRef.add({
          modelId: id,
          email: email || '',
          bio: bio || '',
          rating: rating || 0,
          totalBookings: totalBookings || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const doc = await modelRef.get();
    if (!doc.exists) {
      return { success: false, error: 'Model not found' };
    }

    const data = doc.data();
    const updatedModel: ModelProfile = {
      id: doc.id,
      name: data?.name || '',
      email: data?.email || '',
      phone: data?.phone || '',
      location: data?.location || '',
      bio: data?.bio || '',
      profileImage: data?.profileImage || '',
      rating: Number(data?.rating) || 0,
      totalBookings: Number(data?.totalBookings) || 0,
      username: data?.username || '',
      password: data?.password || '',
      status: data?.status || 'active',
      createdAt: data?.createdAt || '',
      updatedAt: data?.updatedAt || '',
    };

    return { success: true, data: updatedModel };
  } catch (error) {
    console.error('Error updating model in Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteModel(id: string): Promise<FetchModelResponse> {
  try {
    const db = getDb();
    await db.collection('models').doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting model from Firestore:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
