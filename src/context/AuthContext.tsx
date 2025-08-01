'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPublicRoute = ['/login', '/auth/callback'].includes(pathname);

  // Handle initial session and auth state changes
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        console.log('AuthContext: Getting initial session...');
        
        // Skip if we're already on the login page
        if (pathname === '/login') {
          console.log('AuthContext: On login page, skipping initial session check');
          setLoading(false);
          return;
        }
        
        const supabase = getSupabase();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('AuthContext: Initial session data:', { session, error });
        
        if (session) {
          console.log('AuthContext: Session found, setting user and session');
          setSession(session);
          setUser(session.user);
          
          // If we're on the login page but somehow got here, redirect to dashboard
          if (pathname === '/login') {
            const redirectTo = searchParams.get('redirectedFrom') || '/dashboard';
            console.log('AuthContext: On login page with session, redirecting to:', redirectTo);
            router.push(redirectTo);
          }
        } else if (!isPublicRoute) {
          console.log('AuthContext: No session and not on public route, redirecting to login');
          // Store the current path for redirecting back after login
          const redirectPath = pathname === '/' ? '' : pathname;
          router.push(`/login?redirectedFrom=${encodeURIComponent(redirectPath)}`);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const supabase = getSupabase();
    console.log('AuthContext: Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', { event, session });
        
        // Update local state
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('AuthContext: User signed in, handling redirect');
            // Get the redirect URL from the query params or default to dashboard
            const urlParams = new URLSearchParams(window.location.search);
            let redirectTo = urlParams.get('redirectedFrom') || '/dashboard';
            
            // Ensure we don't redirect to the login page
            if (redirectTo.startsWith('/login')) {
              redirectTo = '/dashboard';
            }
            
            console.log('AuthContext: Redirecting to:', redirectTo);
            
            // Only redirect if we're not already on the target page
            if (pathname !== redirectTo) {
              // Use replace instead of push to prevent adding to browser history
              router.replace(redirectTo);
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('AuthContext: User signed out, redirecting to login');
            // Only redirect if we're not already on the login page
            if (pathname !== '/login') {
              router.push('/login');
            }
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('AuthContext: Token refreshed');
            break;
            
          case 'USER_UPDATED':
            console.log('AuthContext: User updated');
            break;
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, pathname, isPublicRoute, searchParams]);

  const signOut = async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
