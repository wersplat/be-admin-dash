'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Processing login...');

  useEffect(() => {
    const processAuth = async () => {
      try {
        setStatus('Processing OAuth response...');
        
        // Get the URL hash which contains the access token
        const hash = window.location.hash;
        if (!hash) {
          throw new Error('No authentication data found in URL');
        }

        // Extract the access token and other parameters from the URL hash
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const errorParam = params.get('error_description') || params.get('error');
        const next = params.get('next') || '/dashboard';

        if (errorParam) {
          throw new Error(decodeURIComponent(errorParam));
        }

        if (!accessToken || !refreshToken) {
          throw new Error('Authentication tokens not found in response');
        }

        setStatus('Setting up session...');
        const supabase = getSupabase();
        
        // Set the session manually
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          throw sessionError;
        }

        if (!data.session) {
          throw new Error('Failed to create session');
        }
        
        setStatus('Login successful! Redirecting...');
        router.push(next);
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setStatus('Authentication failed');
      } finally {
        setIsLoading(false);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      processAuth();
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{status}</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}
