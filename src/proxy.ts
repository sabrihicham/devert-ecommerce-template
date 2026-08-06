import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";

export async function proxy(request: NextRequest) {
  // Check for session cookie (better-auth uses 'better-auth.session_token' by default)
  const sessionToken = request.cookies.get("better-auth.session_token");

  const protectedRoutes = ["/orders", "/admin"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect to login if trying to access protected routes without session
  if (isProtectedRoute && !sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Admin route restriction
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute) {
    // Get the session using better-auth API
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    const role = (session.user as { role?: string }).role;
    const adminEmail = process.env.ADMIN_EMAIL;
    // ADMIN_EMAIL is kept as a bootstrap fallback (self-healed to role="admin"
    // in the DB by verifyAdmin() on the first authorized API call) so a fresh
    // deploy still grants access before the role has been persisted.
    const isAdmin =
      role === "admin" || (!!adminEmail && session.user.email === adminEmail);

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
