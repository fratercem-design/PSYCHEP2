import { LiveGrid } from "@/components/LiveGrid";
import { Rss } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Creator Directory",
  description: "Browse the full directory of creators in The World. See who's live, discover new signals, and find your tribe.",
};

export default function DirectoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <span className="w-16 h-px bg-secondary/30"></span>
          <Rss className="w-6 h-6 mx-4 text-secondary" />
          <span className="w-16 h-px bg-secondary/30"></span>
        </div>

        <h1 className="font-heading text-4xl font-bold text-foreground tracking-tight">
          Creator Directory
        </h1>
        <p className="font-heading text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Every signal in The World. Live streams, creators, and channels from across the Circle.
        </p>
      </div>

      <LiveGrid />
    </div>
  );
}
