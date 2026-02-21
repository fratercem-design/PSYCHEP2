CREATE TYPE "public"."member_tier" AS ENUM('unmarked', 'initiate', 'acolyte', 'seeker', 'adept', 'keeper', 'architect');--> statement-breakpoint
CREATE TYPE "public"."promo_category" AS ENUM('channel', 'project', 'art', 'music', 'service', 'event', 'other');--> statement-breakpoint
CREATE TYPE "public"."promo_status" AS ENUM('pending', 'approved', 'rejected', 'featured', 'expired');--> statement-breakpoint
CREATE TYPE "public"."tx_source" AS ENUM('quest', 'ritual', 'login', 'referral', 'content', 'moderation', 'purchase', 'signal_exchange', 'boost', 'transfer', 'system');--> statement-breakpoint
CREATE TYPE "public"."tx_type" AS ENUM('earn', 'spend', 'transfer', 'burn');--> statement-breakpoint
CREATE TABLE "blog_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text NOT NULL,
	"image_url" text,
	"post_type" "post_type" DEFAULT 'article' NOT NULL,
	"submitter_name" text NOT NULL,
	"submitter_email" text NOT NULL,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_votes" (
	"user_id" text NOT NULL,
	"promo_id" integer NOT NULL,
	"direction" integer NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promo_votes_user_id_promo_id_pk" PRIMARY KEY("user_id","promo_id")
);
--> statement-breakpoint
CREATE TABLE "promos" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"url" text NOT NULL,
	"image_url" text,
	"category" "promo_category" DEFAULT 'other' NOT NULL,
	"status" "promo_status" DEFAULT 'pending' NOT NULL,
	"stake_psyche" integer DEFAULT 20 NOT NULL,
	"votes_up" integer DEFAULT 0 NOT NULL,
	"votes_down" integer DEFAULT 0 NOT NULL,
	"featured_at" timestamp with time zone,
	"featured_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "psyche_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"tx_type" "tx_type" NOT NULL,
	"source" "tx_source" NOT NULL,
	"description" text,
	"related_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "social_links" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tier" "member_tier" DEFAULT 'unmarked' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "psyche_balance" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reputation_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_active" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "promo_votes" ADD CONSTRAINT "promo_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_votes" ADD CONSTRAINT "promo_votes_promo_id_promos_id_fk" FOREIGN KEY ("promo_id") REFERENCES "public"."promos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promos" ADD CONSTRAINT "promos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psyche_transactions" ADD CONSTRAINT "psyche_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");