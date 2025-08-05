'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page when the 404 page is shown
    // You can customize this behavior as needed
    router.replace('/');
  }, [router]);

  // This will be shown very briefly before the redirect happens
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Page not found</h1>
        <p className="text-gray-600">Redirecting to home page...</p>
        <div className="mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
