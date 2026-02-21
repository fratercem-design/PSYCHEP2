import { db } from "@/db";
import { promos, users } from "@/db/schema";
import { eq, desc, and, or } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Zap, TrendingUp, ArrowUpRight } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Signal Exchange",
  description:
    "The Signal Exchange — stake PSYCHE tokens to promote your channel, project, art, or service. Community-curated, tier-weighted voting.",
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  channel: { label: "Channel", color: "text-primary" },
  project: { label: "Project", color: "text-secondary" },
  art: { label: "Art", color: "text-[#FFD166]" },
  music: { label: "Music", color: "text-[#FF6B6B]" },
  service: { label: "Service", color: "text-primary" },
  event: { label: "Event", color: "text-secondary" },
  other: { label: "Other", color: "text-muted-foreground" },
};

export default async function ExchangePage() {
  // Featured promos (active featured slots)
  const featuredPromos = await db.query.promos.findMany({
    where: eq(promos.status, "featured"),
    orderBy: [desc(promos.featuredAt)],
    limit: 3,
    with: { user: true },
  });

  // Approved promos (community board)
  const approvedPromos = await db.query.promos.findMany({
    where: or(
      eq(promos.status, "approved"),
      eq(promos.status, "featured"),
    ),
    orderBy: [desc(promos.createdAt)],
    limit: 20,
    with: { user: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center mb-4">
          <span className="w-16 h-px bg-primary/30"></span>
          <Zap className="w-6 h-6 mx-4 text-primary" />
          <span className="w-16 h-px bg-primary/30"></span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
          Signal Exchange
        </h1>
        <p className="font-heading text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          Stake PSYCHE to amplify your signal. Community-curated, tier-weighted
          voting decides what rises.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>
              {approvedPromos.length} active signal{approvedPromos.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-card border border-border rounded-lg p-6 mb-12">
        <h2 className="font-heading text-sm font-bold text-foreground uppercase tracking-widest mb-4">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-primary font-heading font-bold text-lg">1. Stake</p>
            <p className="text-sm text-muted-foreground mt-1">
              Spend 20 PSYCHE to submit your signal — channel, project, art,
              music, service, or event.
            </p>
          </div>
          <div>
            <p className="text-secondary font-heading font-bold text-lg">
              2. Community Votes
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Members vote up or down. Higher-tier members carry more weight in
              the ranking.
            </p>
          </div>
          <div>
            <p className="text-[#FFD166] font-heading font-bold text-lg">
              3. Rise or Fade
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Top signals get featured placement. Low-rated signals fade from
              the board naturally.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Signals */}
      {featuredPromos.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-lg font-bold text-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#FFD166]" />
            Featured Signals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredPromos.map((promo) => {
              const cat = CATEGORY_LABELS[promo.category] ?? CATEGORY_LABELS.other;
              return (
                <a
                  key={promo.id}
                  href={promo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-card border-2 border-[#FFD166]/30 rounded-lg p-6 hover:border-[#FFD166]/60 transition-colors"
                >
                  {promo.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={promo.imageUrl}
                      alt={promo.title}
                      className="w-full h-32 object-cover rounded mb-4"
                    />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-bold text-foreground group-hover:text-[#FFD166] transition-colors">
                      {promo.title}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {promo.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`text-xs uppercase tracking-wider ${cat.color}`}
                    >
                      {cat.label}
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-primary font-bold">
                        +{promo.votesUp}
                      </span>
                      <span className="text-destructive">
                        -{promo.votesDown}
                      </span>
                    </div>
                  </div>
                  {promo.user && (
                    <p className="text-xs text-muted-foreground mt-3">
                      by{" "}
                      {promo.user.username ? (
                        <Link
                          href={`/profile/${promo.user.username}`}
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          @{promo.user.username}
                        </Link>
                      ) : (
                        promo.user.name ?? "Anonymous"
                      )}
                    </p>
                  )}
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* All Signals */}
      <section>
        <h2 className="font-heading text-lg font-bold text-foreground uppercase tracking-widest mb-6">
          All Signals
        </h2>
        {approvedPromos.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground text-lg">
              The Exchange is quiet. No signals have been transmitted yet.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Be the first to stake your PSYCHE and share your signal with The
              World.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvedPromos.map((promo) => {
              const cat =
                CATEGORY_LABELS[promo.category] ?? CATEGORY_LABELS.other;
              const netVotes = promo.votesUp - promo.votesDown;
              return (
                <div
                  key={promo.id}
                  className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Vote Column */}
                    <div className="flex flex-col items-center gap-1 shrink-0 w-14">
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors text-lg"
                        title="Upvote (sign in required)"
                        disabled
                      >
                        &#9650;
                      </button>
                      <span
                        className={`font-heading font-bold text-sm ${
                          netVotes > 0
                            ? "text-primary"
                            : netVotes < 0
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }`}
                      >
                        {netVotes}
                      </span>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded bg-muted hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors text-lg"
                        title="Downvote (sign in required)"
                        disabled
                      >
                        &#9660;
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <a
                            href={promo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-heading font-bold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                          >
                            {promo.title}
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {promo.description}
                          </p>
                        </div>
                        {promo.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={promo.imageUrl}
                            alt=""
                            className="w-16 h-16 rounded object-cover shrink-0 hidden sm:block"
                          />
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span
                          className={`uppercase tracking-wider font-medium ${cat.color}`}
                        >
                          {cat.label}
                        </span>
                        <span>
                          {promo.stakePsyche} PSY staked
                        </span>
                        {promo.user && (
                          <span>
                            by{" "}
                            {promo.user.username ? (
                              <Link
                                href={`/profile/${promo.user.username}`}
                                className="text-primary hover:underline"
                              >
                                @{promo.user.username}
                              </Link>
                            ) : (
                              promo.user.name ?? "Anonymous"
                            )}
                          </span>
                        )}
                        <span>
                          {promo.createdAt.toLocaleDateString()}
                        </span>
                        {promo.status === "featured" && (
                          <span className="text-[#FFD166] font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
