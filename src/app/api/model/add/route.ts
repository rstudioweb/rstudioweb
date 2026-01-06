import { NextRequest, NextResponse } from 'next/server';
import { addModel } from '@/domain/model';

/**
 * API Route: POST /api/model/add
 * Adds a new model to the Models sheet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, phone, location, profileImage, status } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'id and name are required' },
        { status: 400 },
      );
    }

    // Call the service to add model to sheet
    const result = await addModel({
      id,
      name,
      phone: phone || '',
      location: location || '',
      profileImage: profileImage || '',
      status: status || 'Pending',
      email: '',
      bio: '',
      rating: 0,
      totalBookings: 0,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    console.error('Error in /api/model/add:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
