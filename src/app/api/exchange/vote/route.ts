import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { promoVotes, promos, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Tier → vote weight mapping
const TIER_WEIGHTS: Record<string, number> = {
  unmarked: 1,
  initiate: 1,
  acolyte: 2,
  seeker: 3,
  adept: 5,
  keeper: 8,
  architect: 10,
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to vote" }, { status: 401 });
  }

  const body = await request.json();
  const { promoId, direction } = body;

  if (!promoId || ![-1, 1].includes(direction)) {
    return NextResponse.json(
      { error: "Invalid vote: promoId and direction (1 or -1) required" },
      { status: 400 },
    );
  }

  // Get user's tier for vote weight
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const weight = TIER_WEIGHTS[user.tier] ?? 1;

  // Check if promo exists and is voteable
  const promo = await db.query.promos.findFirst({
    where: eq(promos.id, promoId),
  });

  if (!promo || !["approved", "featured"].includes(promo.status)) {
    return NextResponse.json(
      { error: "Signal not found or not voteable" },
      { status: 404 },
    );
  }

  // Can't vote on your own promo
  if (promo.userId === session.user.id) {
    return NextResponse.json(
      { error: "Cannot vote on your own signal" },
      { status: 403 },
    );
  }

  // Check existing vote
  const existingVote = await db.query.promoVotes.findFirst({
    where: and(
      eq(promoVotes.userId, session.user.id),
      eq(promoVotes.promoId, promoId),
    ),
  });

  if (existingVote) {
    if (existingVote.direction === direction) {
      return NextResponse.json(
        { error: "Already voted in this direction" },
        { status: 409 },
      );
    }

    // Change vote direction — update vote record and adjust counts
    await db
      .update(promoVotes)
      .set({ direction, weight })
      .where(
        and(
          eq(promoVotes.userId, session.user.id),
          eq(promoVotes.promoId, promoId),
        ),
      );

    // Adjust vote counts (remove old vote weight, add new)
    if (direction === 1) {
      // Was down, now up
      await db
        .update(promos)
        .set({
          votesUp: sql`${promos.votesUp} + ${weight}`,
          votesDown: sql`${promos.votesDown} - ${existingVote.weight}`,
        })
        .where(eq(promos.id, promoId));
    } else {
      // Was up, now down
      await db
        .update(promos)
        .set({
          votesUp: sql`${promos.votesUp} - ${existingVote.weight}`,
          votesDown: sql`${promos.votesDown} + ${weight}`,
        })
        .where(eq(promos.id, promoId));
    }
  } else {
    // New vote
    await db.insert(promoVotes).values({
      userId: session.user.id,
      promoId,
      direction,
      weight,
    });

    // Update vote counts
    if (direction === 1) {
      await db
        .update(promos)
        .set({ votesUp: sql`${promos.votesUp} + ${weight}` })
        .where(eq(promos.id, promoId));
    } else {
      await db
        .update(promos)
        .set({ votesDown: sql`${promos.votesDown} + ${weight}` })
        .where(eq(promos.id, promoId));
    }
  }

  return NextResponse.json({ success: true, weight });
}
