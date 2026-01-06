import { NextRequest, NextResponse } from 'next/server';
import { fetchAllMPR, addMPR, updateMPR } from '@/domain/mpr';

/**
 * API Route: GET /api/mpr
 * Fetches all monthly performance reports
 */
export async function GET() {
  try {
    const result = await fetchAllMPR();
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error in GET /api/mpr:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * API Route: POST /api/mpr
 * Adds a new monthly performance report
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, month, mtgt, machv, wkof } = body;

    if (!modelId || !month || mtgt === undefined || wkof === undefined) {
      return NextResponse.json(
        { success: false, error: 'modelId, month, mtgt, and wkof are required' },
        { status: 400 },
      );
    }

    const mdue = Number(mtgt) - Number(machv || 0);
    
    const result = await addMPR({
      modelId,
      month,
      mtgt: Number(mtgt),
      machv: Number(machv || 0),
      mdue,
      remaindays: body.remaindays || 0,
      wkof: Number(wkof),
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/mpr:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * API Route: PUT /api/mpr
 * Updates machv and mdue for an existing MPR record
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, month, machv, mdue } = body;

    if (!modelId || !month || machv === undefined || mdue === undefined) {
      return NextResponse.json(
        { success: false, error: 'modelId, month, machv, and mdue are required' },
        { status: 400 },
      );
    }

    const result = await updateMPR(modelId, month, Number(machv), Number(mdue));

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error in PUT /api/mpr:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
