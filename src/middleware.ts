import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSession(request);

  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  const mainDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  // Only rewrite if hostname is a true subdomain of mainDomain
  // e.g. "gabriel-engenheiro.enghub.com.br" ends with ".enghub.com.br"
  const isSubdomain =
    hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`);

  if (!isSubdomain) {
    return supabaseResponse;
  }

  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/favicon")
  ) {
    return supabaseResponse;
  }

  const slug = hostname.replace(`.${mainDomain}`, "");
  url.pathname = `/${slug}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
