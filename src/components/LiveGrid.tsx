import { db } from "@/db";
import { StreamerCard } from "./StreamerCard";

export async function LiveGrid() {
  const streamersData = await db.query.streamers.findMany({
    with: {
      liveState: {
        with: {
          platform: true,
        },
      },
      accounts: {
        with: {
          platform: true,
        },
      },
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  // Sort: "Cult of Psyche" channel first, then live, then alphabetical
  const sortedStreamers = streamersData.sort((a, b) => {
    const aIsCultOfPsyche = a.displayName.toLowerCase() === 'cultofpsyche';
    const bIsCultOfPsyche = b.displayName.toLowerCase() === 'cultofpsyche';

    if (aIsCultOfPsyche && !bIsCultOfPsyche) return -1;
    if (!aIsCultOfPsyche && bIsCultOfPsyche) return 1;

    const aIsLive = a.liveState?.isLive ?? false;
    const bIsLive = b.liveState?.isLive ?? false;
    if (aIsLive && !bIsLive) return -1;
    if (!aIsLive && bIsLive) return 1;

    return a.displayName.localeCompare(b.displayName);
  });

  if (sortedStreamers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No streamers found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {sortedStreamers.map((streamer) => {
        const liveState = streamer.liveState;
        const isLive = liveState?.isLive ?? false;
        
        let platformName = "Unknown";
        let channelUrl = "#";
        
        if (isLive && liveState?.platform) {
            platformName = liveState.platform.name;
            // Find the account matching this platform to get the URL
            const account = streamer.accounts.find(acc => acc.platformId === liveState.platformId);
            if (account) channelUrl = account.channelUrl;
        } else if (streamer.accounts.length > 0) {
            // Default to the first account if not live
            const account = streamer.accounts[0];
            platformName = account.platform.name;
            channelUrl = account.channelUrl;
        }

        return (
          <StreamerCard
            key={streamer.id}
            displayName={streamer.displayName}
            platform={platformName}
            channelUrl={channelUrl}
            isLive={isLive}
            thumbnailUrl={liveState?.thumbnailUrl}
            avatarUrl={streamer.avatarUrl}
            tags={streamer.tags.map(t => t.tag.name)}
          />
        );
      })}
    </div>
  );
}
