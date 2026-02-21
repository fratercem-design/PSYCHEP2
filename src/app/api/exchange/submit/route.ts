import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { promos, users, psycheTransactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const STAKE_COST = 20; // PSYCHE cost to submit a signal

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to submit" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, url, imageUrl, category } = body;

  // Validate required fields
  if (!title?.trim() || !description?.trim() || !url?.trim()) {
    return NextResponse.json(
      { error: "Title, description, and URL are required" },
      { status: 400 },
    );
  }

  if (title.trim().length > 100) {
    return NextResponse.json(
      { error: "Title must be 100 characters or less" },
      { status: 400 },
    );
  }

  if (description.trim().length > 500) {
    return NextResponse.json(
      { error: "Description must be 500 characters or less" },
      { status: 400 },
    );
  }

  const validCategories = [
    "channel",
    "project",
    "art",
    "music",
    "service",
    "event",
    "other",
  ];
  if (category && !validCategories.includes(category)) {
    return NextResponse.json(
      { error: "Invalid category" },
      { status: 400 },
    );
  }

  // Check user has enough PSYCHE
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.psycheBalance < STAKE_COST) {
    return NextResponse.json(
      {
        error: `Not enough PSYCHE. You need ${STAKE_COST} PSY to submit a signal (you have ${user.psycheBalance}).`,
      },
      { status: 403 },
    );
  }

  // Deduct PSYCHE
  await db
    .update(users)
    .set({ psycheBalance: sql`${users.psycheBalance} - ${STAKE_COST}` })
    .where(eq(users.id, session.user.id));

  // Record transaction
  await db.insert(psycheTransactions).values({
    userId: session.user.id,
    amount: STAKE_COST,
    txType: "spend",
    source: "signal_exchange",
    description: `Staked ${STAKE_COST} PSY for signal: ${title.trim()}`,
  });

  // Create the promo
  const [promo] = await db
    .insert(promos)
    .values({
      userId: session.user.id,
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      imageUrl: imageUrl?.trim() || null,
      category: category || "other",
      status: "pending",
      stakePsyche: STAKE_COST,
    })
    .returning();

  return NextResponse.json({ success: true, promoId: promo.id });
}
