import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  unique,
  primaryKey,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const platformEnum = pgEnum("platform_key", ["twitch", "youtube", "kick"]);
export const roleEnum = pgEnum("user_role", ["admin", "mod"]);
export const eventTypeEnum = pgEnum("event_type", ["go_live", "update", "go_offline"]);
export const submissionStatusEnum = pgEnum("submission_status", ["pending", "approved", "rejected"]);
export const adStatusEnum = pgEnum("ad_status", ["pending", "active", "expired", "cancelled"]);

// Tables

export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  key: platformEnum("key").notNull().unique(),
  name: text("name").notNull(),
});

export const streamers = pgTable("streamers", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull(),
  slug: text("slug").notNull().unique(),
  avatarUrl: text("avatar_url"),
  nsfw: boolean("nsfw").default(false).notNull(),
  softHidden: boolean("soft_hidden").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});



export const blogComments = pgTable("blog_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => blogPosts.id),
  authorId: text("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});




export const postTypeEnum = pgEnum("post_type", ["article", "clip"]);

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url").notNull(),
  authorId: text("author_id").notNull().references(() => users.id),
  postType: postTypeEnum("post_type").default("article").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogPostTags = pgTable(
  "blog_post_tags",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
  })
);

export const blogPostCreators = pgTable(
  "blog_post_creators",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => blogPosts.id, { onDelete: "cascade" }),
    creatorId: integer("creator_id")
      .notNull()
      .references(() => streamers.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.creatorId] }),
  })
);




export const streamerAccounts = pgTable(
  "streamer_accounts",
  {
    id: serial("id").primaryKey(),
    streamerId: integer("streamer_id")
      .notNull()
      .references(() => streamers.id, { onDelete: "cascade" }),
    platformId: integer("platform_id")
      .notNull()
      .references(() => platforms.id, { onDelete: "cascade" }),
    channelId: text("channel_id").notNull(),
    channelUrl: text("channel_url").notNull(),
  },
  (t) => ({
    unq: unique().on(t.streamerId, t.platformId),
  })
);

export const liveStates = pgTable("live_states", {
  streamerId: integer("streamer_id")
    .primaryKey()
    .references(() => streamers.id, { onDelete: "cascade" }),
  platformId: integer("platform_id")
    .notNull()
    .references(() => platforms.id, { onDelete: "cascade" }),
  isLive: boolean("is_live").default(false).notNull(),
  title: text("title"),
  viewerCount: integer("viewer_count").default(0),
  startedAt: timestamp("started_at", { withTimezone: true }),
  thumbnailUrl: text("thumbnail_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const statusEvents = pgTable("status_events", {
  id: serial("id").primaryKey(),
  streamerId: integer("streamer_id")
    .notNull()
    .references(() => streamers.id, { onDelete: "cascade" }),
  platformId: integer("platform_id")
    .notNull()
    .references(() => platforms.id, { onDelete: "cascade" }),
  eventType: eventTypeEnum("event_type").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  payload: jsonb("payload"),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull(),
  youtubeHandle: text("youtube_handle"),
  twitchHandle: text("twitch_handle"),
  kickHandle: text("kick_handle"),
  nsfw: boolean("nsfw").default(false).notNull(),
  status: submissionStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const streamerTags = pgTable(
  "streamer_tags",
  {
    streamerId: integer("streamer_id")
      .notNull()
      .references(() => streamers.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.streamerId, t.tagId] }),
  })
);

export const staffUsers = pgTable("staff_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").default("mod").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminAudit = pgTable("admin_audit", {
  id: serial("id").primaryKey(),
  staffId: uuid("staff_id")
    .notNull()
    .references(() => staffUsers.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  target: text("target").notNull(),
  details: jsonb("details"),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
});

export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url").notNull(),
  status: adStatusEnum("status").default("pending").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  clickCount: integer("click_count").default(0).notNull(),
  impressionCount: integer("impression_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogSubmissions = pgTable("blog_submissions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url"),
  postType: postTypeEnum("post_type").default("article").notNull(),
  submitterName: text("submitter_name").notNull(),
  submitterEmail: text("submitter_email").notNull(),
  status: submissionStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(blogPosts),
  comments: many(blogComments),
  tags: many(blogPostTags),
  creators: many(blogPostCreators),
}));

export const blogPostTagsRelations = relations(blogPostTags, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostTags.postId],
    references: [blogPosts.id],
  }),
  tag: one(tags, {
    fields: [blogPostTags.tagId],
    references: [tags.id],
  }),
}));

export const blogPostCreatorsRelations = relations(blogPostCreators, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostCreators.postId],
    references: [blogPosts.id],
  }),
  creator: one(streamers, {
    fields: [blogPostCreators.creatorId],
    references: [streamers.id],
  }),
}));

export const blogCommentsRelations = relations(blogComments, ({ one }) => ({
  author: one(users, {
    fields: [blogComments.authorId],
    references: [users.id],
  }),
  post: one(blogPosts, {
    fields: [blogComments.postId],
    references: [blogPosts.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
  comments: many(blogComments),
  creators: many(blogPostCreators),
}));

export const streamersRelations = relations(streamers, ({ many, one }) => ({
  accounts: many(streamerAccounts),
  liveState: one(liveStates, {
    fields: [streamers.id],
    references: [liveStates.streamerId],
  }),
  tags: many(streamerTags),
  events: many(statusEvents),
}));

export const streamerAccountsRelations = relations(streamerAccounts, ({ one }) => ({
  streamer: one(streamers, {
    fields: [streamerAccounts.streamerId],
    references: [streamers.id],
  }),
  platform: one(platforms, {
    fields: [streamerAccounts.platformId],
    references: [platforms.id],
  }),
}));

export const liveStatesRelations = relations(liveStates, ({ one }) => ({
  streamer: one(streamers, {
    fields: [liveStates.streamerId],
    references: [streamers.id],
  }),
  platform: one(platforms, {
    fields: [liveStates.platformId],
    references: [platforms.id],
  }),
}));

export const streamerTagsRelations = relations(streamerTags, ({ one }) => ({
  streamer: one(streamers, {
    fields: [streamerTags.streamerId],
    references: [streamers.id],
  }),
  tag: one(tags, {
    fields: [streamerTags.tagId],
    references: [tags.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  streamers: many(streamerTags),
}));

export const adsRelations = relations(ads, () => ({
  // Ads table currently has no foreign‐key relations to other tables
}));
