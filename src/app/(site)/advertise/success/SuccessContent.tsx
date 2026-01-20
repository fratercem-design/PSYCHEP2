'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-6">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h1>
        <p className="text-green-700">
          Thank you for your subscription. Your banner ad will be reviewed and activated within 24 hours.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">What&apos;s Next?</h2>
        <ul className="text-left text-sm text-blue-700 space-y-2">
          <li>• Your ad will be reviewed by our team</li>
          <li>• You&apos;ll receive an email when your ad goes live</li>
          <li>• Your banner will start rotating on our platform</li>
          <li>• You can track performance in your dashboard</li>
        </ul>
      </div>

      <div className="space-y-3">
        <Link
          href="/"
          className="inline-block w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </Link>
        <p className="text-sm text-gray-600">
          Session ID: {sessionId?.slice(0, 8)}... (for your records)
        </p>
      </div>
    </div>
  );
}
