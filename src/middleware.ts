// /middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Use 'jose' for edge runtime

export async function middleware(req: NextRequest) {
  console.log('Middleware triggered:', req.nextUrl.pathname);
  const token = req.cookies.get('authToken')?.value;

  const loginOrSignupPages = ['/login', '/signup'];
  const profilePage = '/profile';

  // If no token exists (user is not logged in)
  if (!token) {
    // Redirect `/profile` to `/login` only if the user is not already on `/login` or `/signup`
    if (req.nextUrl.pathname === profilePage) {
      console.log('Unauthorized, redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next(); // Allow access to `/login` and `/signup`
  }

  try {
    // Verify the token using 'jose' (this works in the edge runtime)
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    console.log('Token verified', payload);

    // If the user is already logged in, prevent access to `/login` and `/signup`
    if (loginOrSignupPages.includes(req.nextUrl.pathname)) {
      // Avoid redirecting to `/profile` if the user is already on `/profile`
      if (req.nextUrl.pathname !== profilePage) {
        return NextResponse.redirect(new URL(profilePage, req.url));
      }
    }

    return NextResponse.next(); // Allow access to `/profile`
  } catch (error) {
    console.error('Invalid token:', error);
    // Invalid token: redirect to `/login`
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/profile', '/login', '/signup'], // Apply middleware to these routes
};
