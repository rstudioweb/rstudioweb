import { NextRequest, NextResponse } from 'next/server';
import { addLoginSession, addLogoutSession, fetchDailySessions } from '@/domain/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');
    const date = searchParams.get('date');
    if (!modelId || !date) {
      return NextResponse.json({ success: false, error: 'modelId and date are required' }, { status: 400 });
    }
    const res = await fetchDailySessions(modelId, date);
    if (!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 500 });
    return NextResponse.json({ success: true, data: res.data }, { status: 200 });
  } catch (error) {
    console.error('GET /api/session error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try { body = await request.json(); } catch { body = {}; }
    const { type, modelId, date, loginAt, logoutAt, deviceId, deviceName } = body || {};
    if (!modelId || !date || !type) {
      return NextResponse.json({ success: false, error: 'type, modelId and date are required' }, { status: 400 });
    }
    if (type === 'login') {
      if (!loginAt) return NextResponse.json({ success: false, error: 'loginAt is required' }, { status: 400 });
      const res = await addLoginSession(modelId, date, loginAt, deviceId, deviceName);
      if (!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 500 });
      return NextResponse.json({ success: true, data: res.data }, { status: 201 });
    }
    if (type === 'logout') {
      if (!logoutAt) return NextResponse.json({ success: false, error: 'logoutAt is required' }, { status: 400 });
      const res = await addLogoutSession(modelId, date, logoutAt, deviceId);
      if (!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 500 });
      return NextResponse.json({ success: true, data: res.data }, { status: 200 });
    }
    return NextResponse.json({ success: false, error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/session error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, date, logoutAt, deviceId } = body || {};
    if (!modelId || !date || !logoutAt) {
      return NextResponse.json({ success: false, error: 'modelId, date and logoutAt are required' }, { status: 400 });
    }
    const res = await addLogoutSession(modelId, date, logoutAt);
    if (!res.success) return NextResponse.json({ success: false, error: res.error }, { status: 500 });
    return NextResponse.json({ success: true, data: res.data }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/session error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
