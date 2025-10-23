import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Test compilation');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Test error' }, { status: 500 });
  }
}