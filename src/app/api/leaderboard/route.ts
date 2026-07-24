import { NextResponse } from 'next/server';
import { getLeaderboardFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leaderboard = getLeaderboardFromDb();
    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    console.error('API /api/leaderboard GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
