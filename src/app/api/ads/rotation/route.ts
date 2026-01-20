import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ads } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const activeAds = await db.select()
      .from(ads)
      .where(and(
        eq(ads.status, 'active'),
        gte(ads.expiresAt, new Date())
      ));
    
    return NextResponse.json({ ads: activeAds });
  } catch (error) {
    console.error('Failed to fetch active ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active ads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { adId } = await request.json();
    
    if (!adId) {
      return NextResponse.json(
        { error: 'Missing ad ID' },
        { status: 400 }
      );
    }
    
    // Increment click count
    await db.update(ads)
      .set({ 
        clickCount: sql`${ads.clickCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(ads.id, adId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track ad click:', error);
    return NextResponse.json(
      { error: 'Failed to track ad click' },
      { status: 500 }
    );
  }
}