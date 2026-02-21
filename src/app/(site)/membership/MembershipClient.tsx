"use client";

import { useState } from "react";
import type { TierConfig } from "@/lib/tiers";
import { Check } from "lucide-react";

export function MembershipClient({
  tiers,
  isLoggedIn,
  currentTier,
}: {
  tiers: TierConfig[];
  isLoggedIn: boolean;
  currentTier: string;
}) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tierKey: string) => {
    if (!isLoggedIn) {
      window.location.href = "/auth/signin?callbackUrl=/membership";
      return;
    }

    setLoadingTier(tierKey);
    try {
      const res = await fetch("/api/membership/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierKey, interval: billing }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Something went wrong");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <>
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <button
          onClick={() => setBilling("monthly")}
          className={`px-4 py-2 text-sm font-heading font-bold rounded-full transition-colors ${
            billing === "monthly"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling("yearly")}
          className={`px-4 py-2 text-sm font-heading font-bold rounded-full transition-colors ${
            billing === "yearly"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Yearly{" "}
          <span className="text-xs opacity-80">(save ~17%)</span>
        </button>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {tiers.map((tier) => {
          const isCurrentTier = currentTier === tier.key;
          const price =
            billing === "monthly" ? tier.monthlyPrice : tier.yearlyPrice;

          return (
            <div
              key={tier.key}
              className={`bg-card border rounded-lg p-6 flex flex-col ${
                isCurrentTier
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/30"
              } transition-colors`}
            >
              {/* Seal + Name */}
              <div className="text-center mb-4">
                <span className="text-3xl block mb-2">{tier.seal}</span>
                <h3
                  className={`font-heading text-xl font-bold ${tier.color}`}
                >
                  {tier.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {tier.tagline}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="font-heading text-3xl font-bold text-foreground">
                  ${price}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{billing === "monthly" ? "mo" : "yr"}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrentTier ? (
                <button
                  disabled
                  className="w-full py-2.5 px-4 rounded-lg bg-muted text-muted-foreground font-heading font-bold text-sm uppercase tracking-wider cursor-default"
                >
                  Current Tier
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(tier.key)}
                  disabled={loadingTier === tier.key}
                  className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed font-heading font-bold text-sm uppercase tracking-wider transition-colors"
                >
                  {loadingTier === tier.key
                    ? "Loading..."
                    : isLoggedIn
                      ? "Subscribe"
                      : "Sign In to Subscribe"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
