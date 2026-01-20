import { db } from "@/db";
import { LiveGrid } from "@/components/LiveGrid";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Rss } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  const streamers = await db.query.streamers.findMany({
    with: {
      liveState: true,
    },
  });

  const liveStreamers = streamers.filter((s) => s.liveState?.isLive);
  const liveCount = liveStreamers.length;

  let title = "StreamerAura - Discover new streamers";
  let description = "A curated list of up-and-coming streamers. Find your next favorite creator.";
  
  if (liveCount > 0) {
    const streamerNames = liveStreamers.map(s => s.displayName).slice(0, 3).join(', ');
    title = `🔴 ${liveCount} Streamer${liveCount > 1 ? 's' : ''} are Live! | StreamerAura`;
    description = `Live now: ${streamerNames}${liveCount > 3 ? ' and more' : ''}. Tune in before the signal fades.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://streameraura.com",
      images: [
        {
          url: "https://streameraura.com/og-image.png", // Replace with your actual OG image URL
          width: 1200,
          height: 630,
          alt: "StreamerAura",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://streameraura.com/og-image.png"], // Replace with your actual OG image URL
    },
  };
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur-sm border-b border-secondary/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center relative">
          <Link href="/" className="flex items-center space-x-4 transform hover:scale-105 transition-transform duration-300">
            <Image src="/images/eye.png" alt="Eye" width={80} height={80} className="drop-shadow-lg" />
            <Image src="/images/psycheverse-logo.png" alt="Psycheverse Logo" width={350} height={80} className="drop-shadow-lg" />
          </Link>
          <Link href="/submit" className="absolute right-4 sm:right-6 lg:right-8 flex items-center hover:scale-110 transition-transform duration-300">
            <Image src="/images/submit-your-stream.jpg" alt="Submit Your Stream" width={150} height={50} className="drop-shadow-lg" />
          </Link>
        </div>
      </header>

      <main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        style={{
          background: `url('/images/hero-background.png') no-repeat center/cover`,
        }}
      >
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="w-16 h-px bg-secondary/30"></span>
            <Rss className="w-6 h-6 mx-4 text-secondary" />
            <span className="w-16 h-px bg-secondary/30"></span>
          </div>
          <h2 className="font-heading text-4xl font-bold text-foreground tracking-tight">
            Signal Detected
          </h2>
          <p className="font-heading text-xl font-bold text-secondary tracking-widest mt-2 max-w-2xl mx-auto uppercase">
            Active streams from across the Panelverse.
            <br />
            Catch the signal!
          </p>
        </div>
        
        <LiveGrid />
        
        <NewsletterSignup />
      </main>
    </div>
  );
}
