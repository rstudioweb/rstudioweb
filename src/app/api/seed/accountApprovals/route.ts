import { seedAccountApprovals } from '@/lib/seed-account-approvals';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await seedAccountApprovals();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
