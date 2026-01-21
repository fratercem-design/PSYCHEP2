import { db } from "@/db";
import { streamers, streamerAccounts, platforms } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import CreateStreamerForm from "./CreateStreamerForm";

async function createStreamer(formData: FormData) {
  "use server";
  
  const displayName = formData.get("displayName") as string;
  const nsfw = formData.get("nsfw") === "true";
  const notes = formData.get("notes") as string;
  const twitchChannel = formData.get("twitchChannel") as string;
  const youtubeChannel = formData.get("youtubeChannel") as string;
  const kickChannel = formData.get("kickChannel") as string;

  if (!displayName) {
    throw new Error("Display name is required");
  }

  // Auto-generate slug from display name
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  try {
    // Check if slug already exists
    const existingStreamer = await db.query.streamers.findFirst({
      where: eq(streamers.slug, slug)
    });

    if (existingStreamer) {
      throw new Error("A streamer with this slug already exists");
    }

    // Auto-generate avatar URL from first available platform
    let avatarUrl = null;
    
    if (twitchChannel) {
      const channelName = twitchChannel.includes('twitch.tv/') 
        ? twitchChannel.split('twitch.tv/')[1].split('/')[0].replace('@', '')
        : twitchChannel.replace('@', '');
      avatarUrl = `https://static-cdn.jtvnw.net/jtv_user_pictures/${channelName}-profile_image-300x300.png`;
    } else if (youtubeChannel) {
      if (youtubeChannel.includes('youtube.com/@')) {
        const channelId = youtubeChannel.split('@')[1].split('/')[0];
        avatarUrl = `https://yt3.googleusercontent.com/ytc/${channelId}=s400-c-k-c0x00ffffff-no-rj`;
      } else if (youtubeChannel.includes('channel/')) {
        const channelId = youtubeChannel.split('channel/')[1].split('/')[0];
        avatarUrl = `https://yt3.googleusercontent.com/ytc/${channelId}=s400-c-k-c0x00ffffff-no-rj`;
      }
    } else if (kickChannel) {
      const channelName = kickChannel.includes('kick.com/') 
        ? kickChannel.split('kick.com/')[1].split('/')[0].replace('@', '')
        : kickChannel.replace('@', '');
      avatarUrl = `https://kick.com/api/${channelName}/avatar`;
    }

    // Create the streamer
    const [newStreamer] = await db.insert(streamers).values({
      displayName,
      slug,
      avatarUrl,
      nsfw,
      notes: notes || null,
    }).returning();

    // Add platform accounts if provided
    const platforms = await db.query.platforms.findMany();
    const platformMap = platforms.reduce((acc, platform) => {
      acc[platform.key] = platform.id;
      return acc;
    }, {} as Record<string, number>);

    const accountPromises = [];

    if (twitchChannel) {
      // Extract channel name from various formats
      let channelName = twitchChannel;
      if (twitchChannel.includes('twitch.tv/')) {
        channelName = twitchChannel.split('twitch.tv/')[1].split('/')[0];
      }
      channelName = channelName.replace('@', ''); // Remove @ if present
      
      accountPromises.push(
        db.insert(streamerAccounts).values({
          streamerId: newStreamer.id,
          platformId: platformMap.twitch,
          channelId: channelName,
          channelUrl: `https://twitch.tv/${channelName}`,
        })
      );
    }

    if (youtubeChannel) {
      // Handle various YouTube URL formats
      let channelId = youtubeChannel;
      
      if (youtubeChannel.includes('youtube.com/@')) {
        // Handle @username format
        channelId = youtubeChannel.split('@')[1].split('/')[0];
        accountPromises.push(
          db.insert(streamerAccounts).values({
            streamerId: newStreamer.id,
            platformId: platformMap.youtube,
            channelId: channelId,
            channelUrl: `https://youtube.com/@${channelId}`,
          })
        );
      } else if (youtubeChannel.includes('channel/')) {
        // Handle channel/UC... format
        channelId = youtubeChannel.split('channel/')[1].split('/')[0];
        accountPromises.push(
          db.insert(streamerAccounts).values({
            streamerId: newStreamer.id,
            platformId: platformMap.youtube,
            channelId: channelId,
            channelUrl: `https://youtube.com/channel/${channelId}`,
          })
        );
      } else if (youtubeChannel.startsWith('UC')) {
        // Handle direct UC... ID
        accountPromises.push(
          db.insert(streamerAccounts).values({
            streamerId: newStreamer.id,
            platformId: platformMap.youtube,
            channelId: channelId,
            channelUrl: `https://youtube.com/channel/${channelId}`,
          })
        );
      }
    }

    if (kickChannel) {
      // Extract channel name from various formats
      let channelName = kickChannel;
      if (kickChannel.includes('kick.com/')) {
        channelName = kickChannel.split('kick.com/')[1].split('/')[0];
      }
      channelName = channelName.replace('@', ''); // Remove @ if present
      
      accountPromises.push(
        db.insert(streamerAccounts).values({
          streamerId: newStreamer.id,
          platformId: platformMap.kick,
          channelId: channelName,
          channelUrl: `https://kick.com/${channelName}`,
        })
      );
    }

    if (accountPromises.length > 0) {
      await Promise.all(accountPromises);
    }

    revalidatePath("/admin/streamers");
    redirect("/admin/streamers");
  } catch (error) {
    console.error("Error creating streamer:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to create streamer: ${error.message}`);
    }
    throw new Error("Failed to create streamer: Unknown error");
  }
}

const AdminStreamersPage = async () => {
  const allStreamers = await db.query.streamers.findMany({
    orderBy: [desc(streamers.createdAt)],
    with: {
      accounts: {
        with: {
          platform: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Streamers Management</h1>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Add Streamer Form */}
      <CreateStreamerForm onSubmit={createStreamer} />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 border-b text-left">Avatar</th>
              <th className="py-3 px-4 border-b text-left">Display Name</th>
              <th className="py-3 px-4 border-b text-left">Slug</th>
              <th className="py-3 px-4 border-b text-left">Platforms</th>
              <th className="py-3 px-4 border-b text-left">NSFW</th>
              <th className="py-3 px-4 border-b text-left">Status</th>
              <th className="py-3 px-4 border-b text-left">Created</th>
              <th className="py-3 px-4 border-b text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {allStreamers.map((streamer) => (
              <tr key={streamer.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">
                  {streamer.avatarUrl ? (
                    <Image
                      src={streamer.avatarUrl}
                      alt={streamer.displayName}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-xs">No Image</span>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 border-b font-medium">{streamer.displayName}</td>
                <td className="py-3 px-4 border-b">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{streamer.slug}</code>
                </td>
                <td className="py-3 px-4 border-b">
                  <div className="flex flex-wrap gap-1">
                    {streamer.accounts.map((account) => (
                      <span
                        key={account.platformId}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        {account.platform.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 border-b">
                  <span className={`px-2 py-1 rounded text-xs ${
                    streamer.nsfw 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {streamer.nsfw ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="py-3 px-4 border-b">
                  <span className={`px-2 py-1 rounded text-xs ${
                    streamer.softHidden 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {streamer.softHidden ? 'Hidden' : 'Active'}
                  </span>
                </td>
                <td className="py-3 px-4 border-b text-sm text-gray-600">
                  {streamer.createdAt.toLocaleDateString()}
                </td>
                <td className="py-3 px-4 border-b text-sm text-gray-600 max-w-xs truncate">
                  {streamer.notes || 'No notes'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {allStreamers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No streamers found in the database.</p>
        </div>
      )}
    </div>
  );
};

export default AdminStreamersPage;