import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const ref = nextUrl.searchParams.get("ref");

  if (ref && !nextUrl.pathname.startsWith("/auth/signup")) {
    const target = new URL("/auth/signup", request.url);
    target.searchParams.set("ref", ref);
    const res = NextResponse.redirect(target);
    res.cookies.set("referrer", ref, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"]
};
