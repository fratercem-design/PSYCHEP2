'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function SubmitPage() {
  const [status, setStatus] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Submitting...');

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus('Submission successful! We will review your channel shortly.');
        (event.target as HTMLFormElement).reset();
      } else {
        const errorData = await response.json();
        setStatus(`Submission failed: ${errorData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Image src="/images/submit-your-stream.jpg" alt="Submit Your Stream to Psycheverse" width={800} height={200} />
        </div>
        <h1 className="text-4xl font-bold text-center mb-8 text-hyper-violet">
        Submit Your Channel
      </h1>
      <p className="text-center text-lg text-fog mb-12 max-w-2xl mx-auto">
        Want to be featured on Psycheverse? Fill out the form below. We are looking for IRL streamers who align with our vision of a connected, vibrant community. Submissions are reviewed by our team.
      </p>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-midnight/50 p-8 rounded-lg border border-hyper-violet/20">
        <div className="mb-6">
          <label htmlFor="displayName" className="block mb-2 text-sm font-medium text-neo-mint">
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            className="bg-midnight border border-hyper-violet/30 text-fog text-sm rounded-lg focus:ring-hyper-violet focus:border-hyper-violet block w-full p-2.5"
            placeholder="Your Streamer Name"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="youtubeHandle" className="block mb-2 text-sm font-medium text-neo-mint">
            YouTube Handle (optional)
          </label>
          <input
            type="text"
            id="youtubeHandle"
            name="youtubeHandle"
            className="bg-midnight border border-hyper-violet/30 text-fog text-sm rounded-lg focus:ring-hyper-violet focus:border-hyper-violet block w-full p-2.5"
            placeholder="@yourhandle"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="twitchHandle" className="block mb-2 text-sm font-medium text-neo-mint">
            Twitch Handle (optional)
          </label>
          <input
            type="text"
            id="twitchHandle"
            name="twitchHandle"
            className="bg-midnight border border-hyper-violet/30 text-fog text-sm rounded-lg focus:ring-hyper-violet focus:border-hyper-violet block w-full p-2.5"
            placeholder="yourhandle"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="kickHandle" className="block mb-2 text-sm font-medium text-neo-mint">
            Kick Handle (optional)
          </label>
          <input
            type="text"
            id="kickHandle"
            name="kickHandle"
            className="bg-midnight border border-hyper-violet/30 text-fog text-sm rounded-lg focus:ring-hyper-violet focus:border-hyper-violet block w-full p-2.5"
            placeholder="@yourhandle"
          />
        </div>
        <button
          type="submit"
          className="text-midnight bg-neo-mint hover:bg-hyper-violet focus:ring-4 focus:outline-none focus:ring-amber-glow font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center transition-colors duration-300"
        >
          Submit for Review
        </button>
        {status && <p className="mt-4 text-center text-sm text-fog">{status}</p>}
      </form>
    </main>
  );
}