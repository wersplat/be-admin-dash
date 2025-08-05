'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
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

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('AuthContext: Getting initial session...');
    
    // In development mode, auto-login as a test user
    if (process.env.NODE_ENV === 'development') {
      console.log('AuthContext: Development mode - bypassing auth');
      const testUser = {
        id: 'test-user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
        app_metadata: { provider: 'email' },
      } as unknown as User;
      
      const testSession = {
        access_token: 'test-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: testUser,
      } as unknown as Session;
      
      setUser(testUser);
      setSession(testSession);
      setLoading(false);
      return;
    }

    // Original auth logic for production
    const supabase = getSupabase();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', { event, session });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext: Initial session data:', { session, error: null });
      if (session) {
        console.log('AuthContext: Session found, setting user and session');
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (process.env.NODE_ENV === 'development') {
      // In development, just clear the test user
      setUser(null);
      setSession(null);
      return;
    }
    
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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
