'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToLogin() {
  const router = useRouter();

  useEffect(() => {
    // This effect only runs on the client side
    if (typeof window === 'undefined') return;
    
    // Always redirect to the login page
    // The login page will handle the redirect to dashboard if already authenticated
    router.replace('/login');
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
