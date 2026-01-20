// src/app/api/submissions/route.ts

import { db } from "@/db";
import { submissions } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { displayName, youtubeHandle, twitchHandle, kickHandle } = await request.json();

    if (!displayName || (!youtubeHandle && !twitchHandle && !kickHandle)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newSubmission = await db
      .insert(submissions)
      .values({
        displayName,
        youtubeHandle,
        twitchHandle,
        kickHandle,
      })
      .returning();

    return NextResponse.json(newSubmission[0], { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
