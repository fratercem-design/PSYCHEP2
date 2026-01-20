import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ads, adStatusEnum } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const allAds = await db.query.ads.findMany({
      where: status ? eq(ads.status, status as (typeof adStatusEnum.enumValues)[number]) : undefined,
    });
    
    return NextResponse.json({ ads: allAds });
  } catch (error) {
    console.error('Failed to fetch ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    );
  }
 }

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const updatedAd = await db.update(ads)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(ads.id, id))
      .returning();
    
    return NextResponse.json({ ad: updatedAd[0] });
  } catch (error) {
    console.error('Failed to update ad:', error);
    return NextResponse.json(
      { error: 'Failed to update ad' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing ad ID' },
        { status: 400 }
      );
    }
    
    await db.delete(ads).where(eq(ads.id, parseInt(id)));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete ad:', error);
    return NextResponse.json(
      { error: 'Failed to delete ad' },
      { status: 500 }
    );
  }
}