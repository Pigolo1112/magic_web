import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { chestType } = await request.json();

    let gold = 0;
    let crystal = 0;
    let exp = 0;
    let rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' = 'Common';
    let itemReward: string | null = null;

    const roll = Math.random();

    if (chestType === 'free') {
      exp = Math.floor(Math.random() * 30) + 20;
      gold = Math.floor(Math.random() * 80) + 40;
      if (roll > 0.7) {
        crystal = Math.floor(Math.random() * 2) + 1;
        rarity = 'Rare';
      }
    } else if (chestType === 'gold') {
      exp = Math.floor(Math.random() * 100) + 50;
      gold = Math.floor(Math.random() * 250) + 100;
      crystal = Math.floor(Math.random() * 5) + 2;

      if (roll > 0.85) {
        rarity = 'Legendary';
        itemReward = 'aura_sparkle';
      } else if (roll > 0.5) {
        rarity = 'Epic';
      } else {
        rarity = 'Rare';
      }
    }

    return NextResponse.json({
      success: true,
      reward: {
        gold,
        crystal,
        exp,
        rarity,
        itemReward,
      },
    });
  } catch (error: any) {
    console.error('API /api/chest POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
