import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Use 'jose' for edge runtime

export async function middleware(req: NextRequest) {
  console.log('Middleware triggered:', req.nextUrl.pathname);
  const token = req.cookies.get('authToken')?.value;

  const loginOrSignupPages = ['/login', '/signup'];
  const protectedPages = ['/profile', '/cart']; // Cart is a protected page

  // If no token exists (user is not logged in)
  if (!token) {
    // Redirect protected pages to `/login` if the user is not already on `/login` or `/signup`
    if (protectedPages.includes(req.nextUrl.pathname)) {
      console.log('Unauthorized, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next(); // Allow access to `/login` and `/signup`
  }

  try {
    // Verify the token using 'jose' (this works in the edge runtime)
    const { payload } = await jwtVerify(
      token, 
      new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev')
    );
    
    console.log('Token verified', payload);

    // Check if the payload has a userId
    if (!payload.userId) {
      console.error('Token payload missing userId');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // If the user is already logged in, prevent access to `/login` and `/signup`
    if (loginOrSignupPages.includes(req.nextUrl.pathname)) {
      // Redirect to `/profile` if the user is trying to access login/signup pages
      return NextResponse.redirect(new URL('/profile', req.url));
    }

    return NextResponse.next(); // Allow access to protected pages
  } catch (error) {
    console.error('Invalid token:', error);
    // Invalid token: redirect to `/login`
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/profile', '/login', '/signup', '/cart'], // Include '/cart' in the matcher
};