import { NextRequest, NextResponse } from 'next/server';
import { handleGoogleCallback } from '@/server-actions/maps-integration';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/account/buying/purchases?error=oauth_failed`
      );
    }

    if (!code || !state) {
      console.error('Missing code or state parameter');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/account/buying/purchases?error=invalid_callback`
      );
    }

    const result = await handleGoogleCallback(code, state);

    if (result.success) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/account/buying/purchases?success=google_connected`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/account/buying/purchases?error=connection_failed`
      );
    }
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/account/buying/purchases?error=callback_error`
    );
  }
}
