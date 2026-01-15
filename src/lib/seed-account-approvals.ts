import { getDb } from '@/lib/firebase';

/**
 * Migration script to create accountApprovals collection with sample data
 * Run this once to initialize the collection
 */

export async function seedAccountApprovals() {
  try {
    const db = getDb();
    const approvalsRef = db.collection('accountApprovals');

    // Sample data to create
    const sampleData = [
      {
        modelId: '1',
        modelName: 'John',
        approvedAccounts: ['SM', 'BJ', 'IL'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const data of sampleData) {
      // Use modelId as document ID
      await approvalsRef.doc(data.modelId).set(data);
      console.log(`Created approval record for modelId: ${data.modelId}`);
    }

    console.log('✅ Sample data created successfully in accountApprovals collection');
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding account approvals:', error);
    return { success: false, error };
  }
}
