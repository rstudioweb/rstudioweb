import { NextRequest, NextResponse } from 'next/server';
import { getCamSitesByModel, addCamSite, updateCamSiteStatus } from '@/domain/camsites';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get('modelId');

    if (!modelId) {
      return NextResponse.json({ success: false, error: 'Missing modelId' }, { status: 400 });
    }

    const result = await getCamSitesByModel(modelId);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/camsites error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { modelId, name, status } = await req.json();

    if (!modelId || !name || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: modelId, name, status' },
        { status: 400 }
      );
    }

    const result = await addCamSite(modelId, name, status);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /api/camsites error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { siteId, status } = await req.json();

    if (!siteId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: siteId, status' },
        { status: 400 }
      );
    }

    const result = await updateCamSiteStatus(siteId, status);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('PUT /api/camsites error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
