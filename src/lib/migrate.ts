/**
 * Data Migration Script: Google Sheets → Firebase Firestore
 * Run this script once to migrate existing data
 */

import { getDb } from './firebase';
import { fetchAllModels } from '@/domain/model/services';
import { fetchAllDPR } from '@/domain/dpr/services';
import { fetchAllMPR } from '@/domain/mpr/services';

export async function migrateModelsToFirestore() {
  console.log('🔄 Migrating Models to Firestore...');
  
  try {
    const result = await fetchAllModels();
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error('Failed to fetch models from Google Sheets');
    }

    const db = getDb();
    const modelsRef = db.collection('models');
    let count = 0;

    for (const model of result.data) {
      await modelsRef.doc(model.id).set({
        name: model.name || '',
        phone: model.phone || '',
        location: model.location || '',
        profileImage: model.profileImage || '',
        username: model.username || '',
        password: model.password || '', // In production, hash passwords!
        status: model.status || 'active',
        createdAt: model.createdAt || new Date().toISOString(),
        updatedAt: model.updatedAt || new Date().toISOString(),
      });
      count++;
    }

    console.log(`✅ Migrated ${count} models to Firestore`);
    return { success: true, count };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error };
  }
}

export async function migrateDPRToFirestore() {
  console.log('🔄 Migrating DPR to Firestore...');
  
  try {
    const result = await fetchAllDPR();
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error('Failed to fetch DPR from Google Sheets');
    }

    const db = getDb();
    const dprRef = db.collection('dpr');
    let count = 0;

    for (const dpr of result.data) {
      // Create unique ID from modelId + date
      const docId = `${dpr.modelId}_${dpr.date}`;
      await dprRef.doc(docId).set({
        modelId: dpr.modelId,
        date: dpr.date,
        dtarget: dpr.dtarget || 0,
        dachv: dpr.dachv || 0,
        ddue: dpr.ddue || 0,
        createdAt: dpr.createdAt || new Date().toISOString(),
      });
      count++;
    }

    console.log(`✅ Migrated ${count} DPR records to Firestore`);
    return { success: true, count };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error };
  }
}

export async function migrateMPRToFirestore() {
  console.log('🔄 Migrating MPR to Firestore...');
  
  try {
    const result = await fetchAllMPR();
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error('Failed to fetch MPR from Google Sheets');
    }

    const db = getDb();
    const mprRef = db.collection('mpr');
    let count = 0;

    for (const mpr of result.data) {
      // Create unique ID from modelId + month
      const docId = `${mpr.modelId}_${mpr.month}`;
      await mprRef.doc(docId).set({
        modelId: mpr.modelId,
        month: mpr.month,
        mtgt: mpr.mtgt || 0,
        machv: mpr.machv || 0,
        mdue: mpr.mdue || 0,
        wkof: mpr.wkof || 0,
        remaindays: mpr.remaindays || 0,
      });
      count++;
    }

    console.log(`✅ Migrated ${count} MPR records to Firestore`);
    return { success: true, count };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error };
  }
}

export async function migrateAllData() {
  console.log('🚀 Starting full migration from Google Sheets to Firestore...\n');
  
  const models = await migrateModelsToFirestore();
  const dpr = await migrateDPRToFirestore();
  const mpr = await migrateMPRToFirestore();

  console.log('\n📊 Migration Summary:');
  console.log(`  Models: ${models.success ? `✅ ${models.count} records` : '❌ Failed'}`);
  console.log(`  DPR: ${dpr.success ? `✅ ${dpr.count} records` : '❌ Failed'}`);
  console.log(`  MPR: ${mpr.success ? `✅ ${mpr.count} records` : '❌ Failed'}`);
  
  return { models, dpr, mpr };
}
