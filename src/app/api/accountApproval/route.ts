import { fetchAccountApprovalByModelId, saveAccountApproval, deleteAccountApproval } from '@/domain/accountApproval';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get('modelId');

    if (!modelId) {
      return NextResponse.json({ success: false, error: 'modelId is required' }, { status: 400 });
    }

    const result = await fetchAccountApprovalByModelId(modelId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching account approval:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelId, modelName, accounts } = body;

    if (!modelId || !modelName || !accounts) {
      return NextResponse.json({ success: false, error: 'modelId, modelName, and accounts are required' }, { status: 400 });
    }

    const result = await saveAccountApproval(modelId, modelName, accounts);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving account approval:', error);
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

    const result = await deleteAccountApproval(modelId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting account approval:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
