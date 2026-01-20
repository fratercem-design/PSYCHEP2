CREATE TYPE "public"."submission_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"youtube_handle" text,
	"twitch_handle" text,
	"kick_handle" text,
	"nsfw" boolean DEFAULT false NOT NULL,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
