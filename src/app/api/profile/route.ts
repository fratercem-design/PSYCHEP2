import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    socialLinks: user.socialLinks ?? {},
    tier: user.tier,
    psycheBalance: user.psycheBalance,
    image: user.image,
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { username, bio, socialLinks } = body;

  // Validate username
  if (username !== undefined) {
    if (typeof username !== "string") {
      return NextResponse.json(
        { error: "Username must be a string" },
        { status: 400 },
      );
    }

    const cleaned = username.trim().toLowerCase();

    if (cleaned.length < 3 || cleaned.length > 30) {
      return NextResponse.json(
        { error: "Username must be 3-30 characters" },
        { status: 400 },
      );
    }

    if (!/^[a-z0-9_-]+$/.test(cleaned)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, hyphens, and underscores" },
        { status: 400 },
      );
    }

    // Check uniqueness
    const existing = await db.query.users.findFirst({
      where: eq(users.username, cleaned),
    });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 },
      );
    }
  }

  // Validate bio
  if (bio !== undefined && typeof bio !== "string") {
    return NextResponse.json(
      { error: "Bio must be a string" },
      { status: 400 },
    );
  }

  // Validate socialLinks
  if (socialLinks !== undefined && typeof socialLinks !== "object") {
    return NextResponse.json(
      { error: "Social links must be an object" },
      { status: 400 },
    );
  }

  // Build update object
  const updateData: Record<string, unknown> = {};
  if (username !== undefined)
    updateData.username = username.trim().toLowerCase();
  if (bio !== undefined) updateData.bio = bio.trim().slice(0, 500);
  if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 },
    );
  }

  await db.update(users).set(updateData).where(eq(users.id, session.user.id));

  return NextResponse.json({ success: true });
}
