import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(req: Request) {
  const session = await auth();
  const url = new URL(req.url);

  // Protect dashboard routes
  if (!session && url.pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("callbackUrl", url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
