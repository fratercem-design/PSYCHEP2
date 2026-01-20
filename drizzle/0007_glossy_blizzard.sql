CREATE TYPE "public"."post_type" AS ENUM('article', 'clip');--> statement-breakpoint
CREATE TABLE "blog_post_creators" (
	"post_id" integer NOT NULL,
	"creator_id" integer NOT NULL,
	CONSTRAINT "blog_post_creators_post_id_creator_id_pk" PRIMARY KEY("post_id","creator_id")
);
--> statement-breakpoint
CREATE TABLE "blog_post_tags" (
	"post_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "blog_post_tags_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "post_type" "post_type" DEFAULT 'article' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_post_creators" ADD CONSTRAINT "blog_post_creators_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_creators" ADD CONSTRAINT "blog_post_creators_creator_id_streamers_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."streamers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;