import type { Metadata } from "next";
import { auth } from "@/auth";
import { TIERS } from "@/lib/tiers";
import { MembershipClient } from "./MembershipClient";

export const metadata: Metadata = {
  title: "The Seven Veils — Membership",
  description:
    "Choose your path through the Seven Veils. Each tier unlocks new powers, quests, and PSYCHE rewards.",
};

export default async function MembershipPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  // @ts-expect-error -- custom session properties
  const currentTier: string = session?.user?.tier ?? "unmarked";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
          The Seven Veils
        </h1>
        <p className="font-heading text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          Each Veil you lift reveals new powers, deeper quests, and greater
          rewards. Choose your path.
        </p>
      </div>

      <MembershipClient
        tiers={TIERS}
        isLoggedIn={isLoggedIn}
        currentTier={currentTier}
      />

      {/* Lifetime Option */}
      <div className="mt-16 max-w-2xl mx-auto bg-card border-2 border-[#FFD166]/30 rounded-lg p-8 text-center">
        <h2 className="font-heading text-2xl font-bold text-[#FFD166]">
          Lifetime Adept — $2,500
        </h2>
        <p className="text-muted-foreground mt-3">
          One payment. Permanent Adept status. All future upgrades included.
          Your seal is etched forever.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          Contact us to arrange lifetime membership.
        </p>
      </div>

      {/* Architect Note */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          <span className="text-secondary font-heading font-bold">
            Architect
          </span>{" "}
          — Invitation only. Granted by Council vote. Governance, profit share,
          eternal glory.
        </p>
      </div>
    </div>
  );
}
