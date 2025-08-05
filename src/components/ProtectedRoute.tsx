'use client';

import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // In development, don't redirect - allow access to all routes
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    // In production, check authentication
    if (!loading && !user) {
      console.log('ProtectedRoute: No user, redirecting to login');
      router.push('/login');
    }
  }, [user, loading, router]);

  // In development, always render children
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }

  // In production, show loading state or children based on auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by the useEffect
  }

  return <>{children}</>;
}
