// Superseded by middleware.ts — kept for reference only.
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes
  const publicRoutes = ["/login", "/signup"];

  const isPublic = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Protect dashboard
  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged-in users shouldn't see login/signup again
  if (user && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};