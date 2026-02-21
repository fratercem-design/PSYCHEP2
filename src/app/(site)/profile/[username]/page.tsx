import { db } from "@/db";
import { users, psycheTransactions, promos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

// Tier display config
const TIER_CONFIG: Record<
  string,
  { label: string; seal: string; color: string; description: string }
> = {
  unmarked: {
    label: "The Unmarked",
    seal: "",
    color: "text-muted-foreground",
    description: "Yet to enter the Circle",
  },
  initiate: {
    label: "Initiate",
    seal: "\u{1F702}",
    color: "text-foreground",
    description: "Committed beginner",
  },
  acolyte: {
    label: "Acolyte",
    seal: "\u{1F704}",
    color: "text-primary",
    description: "Regular participant",
  },
  seeker: {
    label: "Seeker",
    seal: "\u{1F701}",
    color: "text-secondary",
    description: "Contributor & builder",
  },
  adept: {
    label: "Adept",
    seal: "\u{1F703}",
    color: "text-[#FFD166]",
    description: "Leader-in-training",
  },
  keeper: {
    label: "Keeper",
    seal: "\u{1F70F}",
    color: "text-primary",
    description: "Community steward",
  },
  architect: {
    label: "Architect",
    seal: "\u{1F70D}",
    color: "text-secondary",
    description: "Elder & decision-maker",
  },
};

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user) {
    return { title: "Profile Not Found" };
  }

  const tier = TIER_CONFIG[user.tier] ?? TIER_CONFIG.unmarked;

  return {
    title: `${user.name ?? user.username} — ${tier.label}`,
    description:
      user.bio ??
      `${user.name ?? user.username} is a ${tier.label} in the Cult of Psyche.`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  if (!user) {
    notFound();
  }

  const tier = TIER_CONFIG[user.tier] ?? TIER_CONFIG.unmarked;

  // Fetch recent transactions
  const recentTx = await db.query.psycheTransactions.findMany({
    where: eq(psycheTransactions.userId, user.id),
    orderBy: [desc(psycheTransactions.createdAt)],
    limit: 10,
  });

  // Fetch user's promos
  const userPromos = await db.query.promos.findMany({
    where: eq(promos.userId, user.id),
    orderBy: [desc(promos.createdAt)],
    limit: 5,
  });

  const socialLinks = (user.socialLinks ?? {}) as Record<string, string>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-lg p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-muted border-2 border-secondary/30 flex items-center justify-center text-4xl shrink-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? ""}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className={tier.color}>{tier.seal || "?"}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-3xl font-bold text-foreground">
              {user.name ?? user.username}
            </h1>
            {user.username && (
              <p className="text-muted-foreground text-sm mt-1">
                @{user.username}
              </p>
            )}

            {/* Tier Badge */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
              <span className="text-lg">{tier.seal}</span>
              <span className={`font-heading font-bold text-sm ${tier.color}`}>
                {tier.label}
              </span>
              <span className="text-muted-foreground text-xs">
                — {tier.description}
              </span>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="mt-4 text-foreground/80 leading-relaxed max-w-2xl">
                {user.bio}
              </p>
            )}

            {/* Social Links */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider border border-border rounded-full px-3 py-1"
                  >
                    {platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="font-heading text-2xl font-bold text-primary">
              {user.psycheBalance.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              PSYCHE Balance
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="font-heading text-2xl font-bold text-secondary">
              {user.reputationScore.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Reputation
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center col-span-2 sm:col-span-1">
            <p className="font-heading text-2xl font-bold text-foreground">
              {userPromos.length}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Signals Posted
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-4 uppercase tracking-wider">
            Recent Activity
          </h2>
          {recentTx.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No activity yet. The journey begins soon.
            </p>
          ) : (
            <div className="space-y-3">
              {recentTx.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {tx.description ?? tx.source}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`font-heading font-bold text-sm shrink-0 ml-4 ${
                      tx.txType === "earn"
                        ? "text-primary"
                        : tx.txType === "spend"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {tx.txType === "earn" ? "+" : tx.txType === "spend" ? "-" : ""}
                    {tx.amount} PSY
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Signals (Promos) */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-heading text-lg font-bold text-foreground mb-4 uppercase tracking-wider">
            Signals
          </h2>
          {userPromos.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No signals transmitted yet.
            </p>
          ) : (
            <div className="space-y-3">
              {userPromos.map((promo) => (
                <Link
                  key={promo.id}
                  href={promo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {promo.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {promo.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-xs">
                      <span className="text-primary">
                        +{promo.votesUp}
                      </span>
                      <span className="text-destructive">
                        -{promo.votesDown}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider bg-muted px-2 py-0.5 rounded">
                      {promo.category}
                    </span>
                    <span
                      className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded ${
                        promo.status === "featured"
                          ? "bg-primary/10 text-primary"
                          : promo.status === "approved"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {promo.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
