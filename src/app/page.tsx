'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        
        // Redirect based on auth state
        if (session) {
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        // On error, redirect to login
        router.replace('/login');
      } finally {
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}
