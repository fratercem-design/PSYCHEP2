CREATE TYPE "public"."event_type" AS ENUM('go_live', 'update', 'go_offline');--> statement-breakpoint
CREATE TYPE "public"."platform_key" AS ENUM('twitch', 'youtube', 'kick');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'mod');--> statement-breakpoint
CREATE TABLE "admin_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"staff_id" uuid NOT NULL,
	"action" text NOT NULL,
	"target" text NOT NULL,
	"details" jsonb,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_states" (
	"streamer_id" integer PRIMARY KEY NOT NULL,
	"platform_id" integer NOT NULL,
	"is_live" boolean DEFAULT false NOT NULL,
	"title" text,
	"viewer_count" integer DEFAULT 0,
	"started_at" timestamp with time zone,
	"thumbnail_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" "platform_key" NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "platforms_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "staff_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'mod' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "staff_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "status_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"streamer_id" integer NOT NULL,
	"platform_id" integer NOT NULL,
	"event_type" "event_type" NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"payload" jsonb
);
--> statement-breakpoint
CREATE TABLE "streamer_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"streamer_id" integer NOT NULL,
	"platform_id" integer NOT NULL,
	"channel_id" text NOT NULL,
	"channel_url" text NOT NULL,
	CONSTRAINT "streamer_accounts_streamer_id_platform_id_unique" UNIQUE("streamer_id","platform_id")
);
--> statement-breakpoint
CREATE TABLE "streamer_tags" (
	"streamer_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "streamer_tags_streamer_id_tag_id_pk" PRIMARY KEY("streamer_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "streamers" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"slug" text NOT NULL,
	"nsfw" boolean DEFAULT false NOT NULL,
	"soft_hidden" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "streamers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "admin_audit" ADD CONSTRAINT "admin_audit_staff_id_staff_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_states" ADD CONSTRAINT "live_states_streamer_id_streamers_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "public"."streamers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_states" ADD CONSTRAINT "live_states_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_events" ADD CONSTRAINT "status_events_streamer_id_streamers_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "public"."streamers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_events" ADD CONSTRAINT "status_events_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streamer_accounts" ADD CONSTRAINT "streamer_accounts_streamer_id_streamers_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "public"."streamers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streamer_accounts" ADD CONSTRAINT "streamer_accounts_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streamer_tags" ADD CONSTRAINT "streamer_tags_streamer_id_streamers_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "public"."streamers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streamer_tags" ADD CONSTRAINT "streamer_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;