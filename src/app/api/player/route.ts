import { NextRequest, NextResponse } from 'next/server';
import { getPlayerFromDb, savePlayerToDb } from '@/lib/db';
import { PlayerData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const player = getPlayerFromDb(id);
    if (!player) {
      return NextResponse.json({ player: null, message: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({ player });
  } catch (error: any) {
    console.error('API /api/player GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PlayerData = await request.json();
    if (!body.id || !body.name || !body.affinity) {
      return NextResponse.json({ error: 'Invalid player payload' }, { status: 400 });
    }

    const savedPlayer = savePlayerToDb(body);
    return NextResponse.json({ success: true, player: savedPlayer });
  } catch (error: any) {
    console.error('API /api/player POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
