'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="text-gray-400 text-sm font-mono">
          {error.message || 'An unexpected error occurred'}
        </p>
        {error.digest && (
          <p className="text-gray-500 text-xs font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4 justify-center pt-4">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-[#ff5722] text-white rounded-lg font-medium hover:bg-[#ff5722]/90 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/chat'}
            className="px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            Go to Chat
          </button>
        </div>
      </div>
    </div>
  );
}
