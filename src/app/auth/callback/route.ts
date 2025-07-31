import { createServerClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  const error = requestUrl.searchParams.get('error');

  // If there's an error, redirect to login with the error
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // If we have a code, exchange it for a session
  if (code) {
    const supabase = createServerClient();
    
    try {
      const { error: authError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (authError) {
        console.error('Error exchanging code for session:', authError);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(authError.message)}`, request.url)
        );
      }
    } catch (error) {
      console.error('Unexpected error during authentication:', error);
      return NextResponse.redirect(
        new URL('/login?error=An unexpected error occurred', request.url)
      );
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, request.url));
}
