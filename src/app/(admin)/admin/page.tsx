
import { db } from "@/db";
import { submissions, ads } from "@/db/schema";
import { approveSubmission, rejectSubmission, approveAd, rejectAd, deleteAd } from "./actions";
import Image from "next/image";

const AdminPage = async () => {
  const allSubmissions = await db.select().from(submissions);
  const allAds = await db.select().from(ads);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Streamer Submissions</h1>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Display Name</th>
              <th className="py-2 px-4 border-b">YouTube</th>
              <th className="py-2 px-4 border-b">Twitch</th>
              <th className="py-2 px-4 border-b">Kick</th>
              <th className="py-2 px-4 border-b">NSFW</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Notes</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allSubmissions.map((submission) => (
              <tr key={submission.id}>
                <td className="py-2 px-4 border-b">{submission.displayName}</td>
                <td className="py-2 px-4 border-b">{submission.youtubeHandle}</td>
                <td className="py-2 px-4 border-b">{submission.twitchHandle}</td>
                <td className="py-2 px-4 border-b">{submission.kickHandle}</td>
                <td className="py-2 px-4 border-b">{submission.nsfw ? 'Yes' : 'No'}</td>
                <td className="py-2 px-4 border-b">{submission.status}</td>
                <td className="py-2 px-4 border-b">{submission.notes}</td>
                <td className="py-2 px-4 border-b">
                  <form action={approveSubmission.bind(null, submission.id)} className="inline">
                    <button className="bg-green-500 text-white py-1 px-2 rounded mr-2">Approve</button>
                  </form>
                  <form action={rejectSubmission.bind(null, submission.id)} className="inline">
                    <button className="bg-red-500 text-white py-1 px-2 rounded">Reject</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h1 className="text-2xl font-bold mb-4">Banner Ads</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Image</th>
              <th className="py-2 px-4 border-b">Link</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Expires At</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allAds.map((ad) => (
              <tr key={ad.id}>
                <td className="py-2 px-4 border-b">{ad.title}</td>
                <td className="py-2 px-4 border-b">
                  <Image src={ad.imageUrl} alt={ad.title} width={128} height={72} className="w-32 h-auto" />
                </td>
                <td className="py-2 px-4 border-b">
                  <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {ad.linkUrl}
                  </a>
                </td>
                <td className="py-2 px-4 border-b">{ad.status}</td>
                <td className="py-2 px-4 border-b">{ad.expiresAt?.toLocaleString()}</td>
                <td className="py-2 px-4 border-b">
                  {ad.status === 'pending' && (
                    <form action={approveAd.bind(null, ad.id)} className="inline">
                      <button className="bg-green-500 text-white py-1 px-2 rounded mr-2">Approve</button>
                    </form>
                  )}
                  {ad.status === 'active' && (
                    <form action={rejectAd.bind(null, ad.id)} className="inline">
                      <button className="bg-yellow-500 text-white py-1 px-2 rounded mr-2">Reject</button>
                    </form>
                  )}
                  <form action={deleteAd.bind(null, ad.id)} className="inline">
                    <button className="bg-red-500 text-white py-1 px-2 rounded">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
