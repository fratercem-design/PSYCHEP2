import { db } from "@/db";
import { streamers } from "@/db/schema";
import { eq } from "drizzle-orm";

type LiveContextSidebarProps = {
  creatorIds: number[];
};

export async function LiveContextSidebar({ creatorIds }: LiveContextSidebarProps) {
  if (!creatorIds || creatorIds.length === 0) {
    return null;
  }

  const relatedCreators = await db.query.streamers.findMany({
    where: (streamers, { inArray }) => inArray(streamers.id, creatorIds),
    with: {
      liveState: true,
    },
  });

  return (
    <div className="border-l border-gray-200 dark:border-gray-700 pl-4">
      <h2 className="text-lg font-semibold mb-4">Live Context</h2>
      <div className="space-y-4">
        {relatedCreators.map((creator) => (
          <div key={creator.id} className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={creator.avatarUrl || '/placeholder-avatar.png'}
                alt={creator.displayName}
                className="w-10 h-10 rounded-full"
              />
              {creator.liveState?.isLive && (
                <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold">{creator.displayName}</p>
              {creator.liveState?.isLive ? (
                <p className="text-sm text-red-500 font-bold">
                  LIVE ({creator.liveState.viewerCount} viewers)
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Offline</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}