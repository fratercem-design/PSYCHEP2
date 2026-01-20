'use client';

import { ExternalLink, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface StreamerCardProps {
  displayName: string;
  platform: string;
  channelUrl: string;
  isLive: boolean;
  thumbnailUrl?: string | null;
  avatarUrl?: string | null;
  tags: string[];
}

export function StreamerCard({
  displayName,
  platform,
  channelUrl,
  isLive,
  thumbnailUrl,
  avatarUrl,
  tags,
}: StreamerCardProps) {
  // Filter out known bad YouTube thumbnails
  const isValidThumbnail = thumbnailUrl && !thumbnailUrl.includes('hqdefault_live.jpg');

  return (
    <a
      href={channelUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative block overflow-hidden rounded-xl border bg-card transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-2xl",
        isLive
          ? "border-primary shadow-lg shadow-primary/20 hover:shadow-primary/40"
          : "border-secondary/20 hover:border-secondary"
      )}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {isLive && isValidThumbnail ? (
          <img
            src={thumbnailUrl}
            alt={`${displayName} thumbnail`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative w-full h-full">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${displayName} avatar`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105 blur-sm opacity-70"
              />
            ) : (
              <Image
                src="/images/cult-of-psyche-offline.png"
                alt="Streamer Offline"
                fill
                className={cn("object-cover", displayName.toLowerCase() === 'cultofpsyche' ? "object-bottom" : "object-center")}
              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
              <span className="text-white font-bold text-sm uppercase tracking-widest">
                {isLive ? "Live Streaming!" : "Offline"}
              </span>
            </div>
          </div>
        )}

        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse shadow-destructive/50">
            <Radio className="w-3 h-3" />
            LIVE
          </div>
        )}
        
        {/* Platform Badge */}
        {platform.toLowerCase() === 'youtube' && (
          <div className="absolute bottom-3 right-3 w-8 h-8 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
            {/* <Image src="/images/youtube-icon.png" alt="YouTube" width={20} height={20} /> */}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 bg-card">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-heading font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
            {displayName}
          </h3>
          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-secondary/20 text-secondary-foreground text-[10px] font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-0.5 bg-secondary/20 text-secondary-foreground text-[10px] font-medium rounded-full">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}
