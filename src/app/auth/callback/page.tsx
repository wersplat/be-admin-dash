'use client';

import { getSupabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const next = searchParams.get('next') || '/dashboard';

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (error) {
        router.push(`/login?error=${encodeURIComponent(error)}`);
        return;
      }

      if (code) {
        const supabase = getSupabase();
        try {
          const { error: authError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (authError) {
            console.error('Error exchanging code for session:', authError);
            router.push(`/login?error=${encodeURIComponent(authError.message)}`);
            return;
          }
          
          // Success - redirect to the dashboard or the next URL
          router.push(next);
        } catch (err) {
          console.error('Unexpected error during auth callback:', err);
          router.push('/login?error=An unexpected error occurred');
        }
      } else {
        // No code or error, redirect to home
        router.push('/dashboard');
      }
    };

    handleAuthCallback();
  }, [code, error, next, router]);

  // Show a loading state while processing
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-2xl font-semibold">Signing you in...</div>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
      </div>
    </div>
  );
}
