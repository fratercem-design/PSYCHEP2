import { auth } from "@/auth";
import { tierMeetsMinimum } from "@/lib/tiers";
import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Unlock, BookOpen, Video, FileText, Star } from "lucide-react";

const NYX_MOLTBOOK_SKILLS = {
  basic: [
    "Create profile + bio optimized for discovery",
    "Draft clear post titles and one-line hooks",
    "Use posting checklist (media, tags, CTA, links)",
    "Follow ideal timing windows and posting cadence",
  ],
  intermediate: [
    "Build multi-post content arcs (3-5 post sequences)",
    "Repurpose one idea into clip, carousel, and long-form variants",
    "Tune copy with audience-specific voice prompts",
    "Run simple A/B tests on headlines and thumbnails",
  ],
  advanced: [
    "Launch weekly conversion campaigns from awareness to sign-up",
    "Track posting analytics and adapt strategy using trend signals",
    "Build collaboration workflows and guest amplification loops",
    "Automate content pipeline with review, scheduling, and QA passes",
  ],
};

const NYX_ASSISTANTS = [
  {
    name: "Post Architect",
    focus: "Turns rough ideas into publish-ready Moltbook posts.",
  },
  {
    name: "Hook Smith",
    focus: "Generates high-retention opening lines and title options.",
  },
  {
    name: "Visual Director",
    focus: "Suggests image or clip pairings for each post format.",
  },
  {
    name: "Engagement Strategist",
    focus: "Builds prompts, replies, and follow-up thread plans.",
  },
  {
    name: "Analytics Sentinel",
    focus: "Reads performance signals and recommends next moves.",
  },
];

export const metadata: Metadata = {
  title: "The Vault",
  description:
    "Member-only resources, guides, and rituals. Access requires Initiate tier or higher.",
};

const VAULT_SECTIONS = [
  {
    title: "The Codex",
    description: "Core teachings, guides, and frameworks for personal transformation.",
    icon: BookOpen,
    requiredTier: "initiate",
    items: [
      "First Rite Walkthrough",
      "PSYCHE Economy Field Guide",
      "Community Values & Code of Conduct",
    ],
  },
  {
    title: "Ritual Archives",
    description: "Recordings of past rituals and ceremonies.",
    icon: Video,
    requiredTier: "acolyte",
    items: [
      "Weekly Ritual Replays",
      "Ascension Ceremonies Archive",
      "Guest Speaker Sessions",
    ],
  },
  {
    title: "Builder's Workshop",
    description: "Templates, tools, and resources for creators and contributors.",
    icon: FileText,
    requiredTier: "seeker",
    items: [
      "Content Creation Templates",
      "Branding Asset Pack",
      "Quest Design Framework",
    ],
  },
  {
    title: "Inner Sanctum",
    description: "Strategy documents, early access, and decision-making resources.",
    icon: Star,
    requiredTier: "adept",
    items: [
      "Roadmap & Strategy Docs",
      "Beta Feature Access",
      "Revenue Reports",
    ],
  },
];

const TIER_LABELS: Record<string, string> = {
  initiate: "Initiate+",
  acolyte: "Acolyte+",
  seeker: "Seeker+",
  adept: "Adept+",
  keeper: "Keeper+",
  architect: "Architect",
};

export default async function VaultPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  // @ts-expect-error -- custom session properties
  const userTier: string = session?.user?.tier ?? "unmarked";

  const isUnmarked = userTier === "unmarked";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Lock className="w-10 h-10 text-secondary mx-auto mb-4" />
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
          The Vault
        </h1>
        <p className="font-heading text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          Member-only resources, guides, and ritual archives. Each section
          requires a deeper Veil to access.
        </p>
      </div>

      {/* Gate Message */}
      {!isLoggedIn && (
        <div className="bg-card border border-border rounded-lg p-6 mb-10 text-center">
          <p className="text-muted-foreground">
            <Link href="/auth/signin?callbackUrl=/vault" className="text-primary hover:underline font-medium">
              Sign in
            </Link>{" "}
            and{" "}
            <Link href="/membership" className="text-secondary hover:underline font-medium">
              become a member
            </Link>{" "}
            to unlock The Vault.
          </p>
        </div>
      )}

      {isLoggedIn && isUnmarked && (
        <div className="bg-card border border-secondary/30 rounded-lg p-6 mb-10 text-center">
          <p className="text-muted-foreground">
            You are <span className="text-foreground font-medium">Unmarked</span>.{" "}
            <Link href="/membership" className="text-primary hover:underline font-medium">
              Lift the First Veil
            </Link>{" "}
            to begin accessing The Vault.
          </p>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {VAULT_SECTIONS.map((section) => {
          const hasAccess =
            isLoggedIn && tierMeetsMinimum(userTier, section.requiredTier);
          const Icon = section.icon;

          return (
            <div
              key={section.title}
              className={`bg-card border rounded-lg p-6 transition-colors ${
                hasAccess
                  ? "border-primary/30"
                  : "border-border opacity-70"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg shrink-0 ${
                    hasAccess ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  {hasAccess ? (
                    <Unlock
                      className={`w-6 h-6 ${
                        hasAccess ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  ) : (
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-heading text-xl font-bold text-foreground">
                      {section.title}
                    </h2>
                    <span
                      className={`text-xs font-heading uppercase tracking-wider px-2 py-1 rounded-full shrink-0 ${
                        hasAccess
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {TIER_LABELS[section.requiredTier] ?? section.requiredTier}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-1">
                    {section.description}
                  </p>

                  {hasAccess ? (
                    <ul className="mt-4 space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm text-foreground">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-4 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Requires {TIER_LABELS[section.requiredTier]} membership
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-card border border-primary/20 rounded-lg p-6 sm:p-8">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Nyx Moltbook Posting Skill Path
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          A focused progression from basic to advanced posting skills so Nyx can post consistently and confidently.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-heading text-lg font-semibold text-foreground">Basic</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
              {NYX_MOLTBOOK_SKILLS.basic.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="font-heading text-lg font-semibold text-foreground">Intermediate</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
              {NYX_MOLTBOOK_SKILLS.intermediate.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="font-heading text-lg font-semibold text-foreground">Advanced</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
              {NYX_MOLTBOOK_SKILLS.advanced.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-card border border-secondary/20 rounded-lg p-6 sm:p-8">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Nyx Assistant Team (Separated from Personas)
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Dedicated assistants are now configured as their own team, not bundled under a persona skill.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {NYX_ASSISTANTS.map((assistant) => (
            <div key={assistant.name} className="rounded-md border border-border p-4">
              <p className="text-sm font-semibold text-foreground">{assistant.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{assistant.focus}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
