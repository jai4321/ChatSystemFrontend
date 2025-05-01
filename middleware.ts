import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigin = "http://localhost:3000";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("Middleware triggered for path:", pathname); // This should log every request

  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    const token = request.cookies.get("token")?.value;
    if (token) {
      return NextResponse.redirect(new URL("/user", request.url));
    }
  }

  if (pathname.startsWith("/user")) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/api/")) {
    const origin =
      request.headers.get("origin") || request.headers.get("referer") || "";

    // Reject if the origin doesn't match the allowed origin
    if (origin && !origin.startsWith(allowedOrigin)) {
      return NextResponse.json(
        { error: "Forbidden - Invalid Origin" },
        { status: 403 }
      );
    }
  }

  // If no issues, continue the request
  return NextResponse.next();
}

// Apply middleware to all paths except static files
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"], // Exclude static files from middleware
};
