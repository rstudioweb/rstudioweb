import { NextRequest, NextResponse } from 'next/server';
import { migrateAllData } from '@/lib/migrate';

/**
 * API Route: POST /api/migrate
 * Migrates data from Google Sheets to Firestore
 * ⚠️ Run this ONCE to copy existing data
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Starting data migration...');
    
    const result = await migrateAllData();
    
    const allSuccess = result.models.success && result.dpr.success && result.mpr.success;
    
    return NextResponse.json({
      success: allSuccess,
      message: allSuccess ? 'Migration completed successfully' : 'Migration completed with errors',
      details: result,
    }, { status: allSuccess ? 200 : 500 });
  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Migration failed' 
      },
      { status: 500 }
    );
  }
}
