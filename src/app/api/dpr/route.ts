import { NextRequest, NextResponse } from 'next/server';
import { fetchAllDPR, addDPR } from '@/domain/dpr';

/**
 * API Route: GET/POST /api/dpr
 * GET: List all DPR entries
 * POST: Add new DPR entry
 */
export async function GET() {
  try {
    const result = await fetchAllDPR();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
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
