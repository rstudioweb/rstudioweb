import { fetchAccountByModelId, saveModelAccount, deleteModelAccount } from '@/domain/modelAccount';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get('modelId');

    if (!modelId) {
      return NextResponse.json({ success: false, error: 'modelId is required' }, { status: 400 });
    }

    const result = await fetchAccountByModelId(modelId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching model account:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelId, email, bio, rating, totalBookings } = body;

    if (!modelId) {
      return NextResponse.json({ success: false, error: 'modelId is required' }, { status: 400 });
    }

    const result = await saveModelAccount(modelId, {
      email,
      bio,
      rating: rating ? Number(rating) : undefined,
      totalBookings: totalBookings ? Number(totalBookings) : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving model account:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get('modelId');

    if (!modelId) {
      return NextResponse.json({ success: false, error: 'modelId is required' }, { status: 400 });
    }

    const result = await deleteModelAccount(modelId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting model account:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
