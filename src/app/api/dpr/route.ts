import { NextRequest, NextResponse } from 'next/server';
import { fetchAllDPR, addDPR, updateDPR, deleteDPR } from '@/domain/dpr';

/**
 * API Route: GET/POST/PUT /api/dpr
 * GET: List DPR entries (optionally filtered by modelId)
 * POST: Add new DPR entry
 * PUT: Update existing DPR entry
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');

    const result = await fetchAllDPR();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    // Filter by modelId if provided
    if (modelId && Array.isArray(result.data)) {
      const filtered = result.data.filter((d) => d.modelId === modelId);
      return NextResponse.json({ success: true, data: filtered }, { status: 200 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/dpr:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, date, dtarget, dachv } = body;

    if (!modelId || !date || !dtarget || dachv === undefined) {
      return NextResponse.json(
        { success: false, error: 'modelId, date, dtarget, dachv are required' },
        { status: 400 },
      );
    }

    const ddue = Number(dtarget) - Number(dachv);
    const result = await addDPR({ modelId, date, dtarget: Number(dtarget), dachv: Number(dachv), ddue });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/dpr:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, date, dtarget, dachv } = body;

    if (!modelId || !date || !dtarget || dachv === undefined) {
      return NextResponse.json(
        { success: false, error: 'modelId, date, dtarget, dachv are required' },
        { status: 400 },
      );
    }

    const ddue = Number(dtarget) - Number(dachv);
    const result = await updateDPR(modelId, date, { dtarget: Number(dtarget), dachv: Number(dachv), ddue });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/dpr:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');
    const date = searchParams.get('date');

    if (!modelId || !date) {
      return NextResponse.json(
        { success: false, error: 'modelId and date are required' },
        { status: 400 },
      );
    }

    const result = await deleteDPR(modelId, date);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/dpr:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
