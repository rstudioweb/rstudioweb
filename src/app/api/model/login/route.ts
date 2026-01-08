import { NextRequest, NextResponse } from 'next/server';
import { fetchAllModels } from '@/domain/model';

/**
 * API Route: POST /api/model/login
 * Authenticates model with username and password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 },
      );
    }

    // Fetch all models to find matching credentials
    const result = await fetchAllModels();

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch models' },
        { status: 500 },
      );
    }

    const models = Array.isArray(result.data) ? result.data : [result.data];

    // Find model with matching username and password
    const matchedModel = models.find(
      (m) => m.username === username && m.password === password,
    );

    if (!matchedModel) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 },
      );
    }

    // Return model data without password
    const { password: _, ...modelData } = matchedModel;

    return NextResponse.json({ success: true, data: modelData }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/model/login:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
