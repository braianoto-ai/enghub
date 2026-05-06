import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSession(request);

  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  const mainDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  const currentHost = hostname
    .replace(`.${mainDomain}`, "")
    .replace(`:${url.port}`, "");

  if (currentHost === mainDomain || currentHost === "localhost") {
    return supabaseResponse;
  }

  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/favicon")
  ) {
    return supabaseResponse;
  }

  url.pathname = `/${currentHost}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
