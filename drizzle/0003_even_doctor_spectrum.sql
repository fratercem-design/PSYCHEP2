CREATE TYPE "public"."ad_status" AS ENUM('pending', 'active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TABLE "ads" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"image_url" text NOT NULL,
	"link_url" text NOT NULL,
	"status" "ad_status" DEFAULT 'pending' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"starts_at" timestamp,
	"expires_at" timestamp,
	"click_count" integer DEFAULT 0 NOT NULL,
	"impression_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
