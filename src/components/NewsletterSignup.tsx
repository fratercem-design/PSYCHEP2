'use client';

import { useState } from 'react';

export const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thanks for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-midnight/50 border border-hyper-violet/20 rounded-lg p-6 max-w-md mx-auto mt-12">
      <h3 className="text-xl font-bold text-neo-mint mb-2">Join the Psycheverse</h3>
      <p className="text-fog mb-4 text-sm">
        Get updates on new streamers, features, and events.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 bg-midnight border border-hyper-violet/30 text-fog text-sm rounded-lg focus:ring-hyper-violet focus:border-hyper-violet p-2.5"
          required
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-hyper-violet hover:bg-hyper-violet/80 text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-4 focus:ring-hyper-violet/30 disabled:opacity-50"
        >
          {status === 'loading' ? 'Joining...' : 'Join'}
        </button>
      </form>
      {message && (
        <p className={`mt-2 text-sm ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
};
