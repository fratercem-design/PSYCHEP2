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

  let title = "Psycheverse — The World";
  let description = "The living hub of the Cult of Psyche. Discover creators, catch live signals, and ascend through The World.";

  if (liveCount > 0) {
    const streamerNames = liveStreamers.map(s => s.displayName).slice(0, 3).join(', ');
    title = `🔴 ${liveCount} Live Now | Psycheverse`;
    description = `Live now: ${streamerNames}${liveCount > 3 ? ' and more' : ''}. Tune in before the signal fades.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "https://psycheverse.org",
      images: [
        {
          url: "https://psycheverse.org/og-image.png",
          width: 1200,
          height: 630,
          alt: "Psycheverse — The World",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://psycheverse.org/og-image.png"],
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Psycheverse",
  alternateName: "Cult of Psyche — The World",
  url: "https://psycheverse.org",
  description: "The living hub of the Cult of Psyche. Discover creators, catch live signals, and ascend through The World.",
  publisher: {
    "@type": "Organization",
    name: "Cult of Psyche",
    url: "https://cultofpsyche.com",
    sameAs: [
      "https://cultcodex.me",
      "https://psycheverse.org",
    ],
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://psycheverse.org/directory?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default async function Home() {
  return (
    <div className="bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Banner */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center justify-center transform hover:scale-[1.01] transition-transform duration-300">
            <Image
              src="/images/psycheverse-banner.png"
              alt="Psycheverse — The World"
              width={1200}
              height={300}
              className="drop-shadow-lg w-full max-w-6xl h-auto rounded-lg"
              priority
            />
          </Link>
        </div>
      </section>

      {/* Signal Section */}
      <section
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

          <div className="flex justify-center mb-8">
            <Link href="/submit" className="flex items-center hover:scale-105 transition-transform duration-300">
              <Image src="/images/submit-your-stream.jpg" alt="Submit Your Signal" width={240} height={80} className="drop-shadow-lg rounded-lg" />
            </Link>
          </div>

          <h2 className="font-heading text-4xl font-bold text-foreground tracking-tight">
            Signal Detected
          </h2>
          <p className="font-heading text-xl font-bold text-secondary tracking-widest mt-2 max-w-2xl mx-auto uppercase">
            Live signals from across The World.
            <br />
            Catch the signal before it fades.
          </p>

          <div className="mt-6 flex items-center justify-center gap-6">
            <Link href="/directory" className="text-sm font-bold text-primary hover:text-foreground transition-colors uppercase tracking-widest border-b-2 border-primary pb-1">
              Full Directory
            </Link>
            <Link href="/blog" className="text-sm font-bold text-secondary hover:text-foreground transition-colors uppercase tracking-widest border-b-2 border-secondary pb-1">
              Read the Blog
            </Link>
          </div>
        </div>

        <LiveGrid />

        <NewsletterSignup />
      </section>
    </div>
  );
}
