import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Handle Socket.io upgrade requests
  if (request.nextUrl.pathname.startsWith("/api/socket")) {
    return NextResponse.next()
  }

  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/signup", "/about", "/how-it-works", "/contact", "/terms", "/privacy"]

  // Check if the path is public
  const isPublicPath = publicPaths.some((publicPath) => path === publicPath || path.startsWith(publicPath + "/"))

  // Get the token from the request
  const token = await getToken({ req: request })

  // If the path is not public and the user is not authenticated, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If the path is login or signup and the user is authenticated, redirect to dashboard
  if ((path === "/login" || path === "/signup") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
