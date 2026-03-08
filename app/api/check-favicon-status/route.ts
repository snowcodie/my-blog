import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Route is locked - functionality disabled
    return NextResponse.json(
      { error: 'This diagnostic endpoint has been disabled' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
