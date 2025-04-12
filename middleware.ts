import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Get the pathname
  const { pathname } = request.nextUrl

  // Check if the user is authenticated via cookies
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value === "true"

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/"]

  // If the user is not authenticated and trying to access a protected route
  if (!isLoggedIn && !publicRoutes.includes(pathname)) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // If the user is authenticated and trying to access login/signup pages
  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}
