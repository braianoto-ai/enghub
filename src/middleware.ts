import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Routes that skip locale middleware
const BYPASS_PREFIXES = [
  "/dashboard",
  "/admin",
  "/api",
  "/_next",
  "/favicon",
  "/manifest",
  "/sw.js",
  "/offline",
  "/icon",
  "/apple-icon",
  "/robots.txt",
  "/sitemap.xml",
];

export async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSession(request);

  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();
  const mainDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

  // Handle subdomain routing
  const isSubdomain =
    hostname !== mainDomain && hostname.endsWith(`.${mainDomain}`);

  if (isSubdomain) {
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

  // Skip locale middleware for non-public routes
  const shouldBypass = BYPASS_PREFIXES.some((prefix) =>
    url.pathname === prefix || url.pathname.startsWith(prefix + "/")
  );

  if (shouldBypass) {
    return supabaseResponse;
  }

  // Apply i18n routing for public pages
  const intlResponse = intlMiddleware(request);

  // Merge Supabase auth cookies into intl response.
  // IMPORTANTE: passar o objeto completo do cookie (com maxAge, path, httpOnly,
  // secure, sameSite). Copiar só name+value fazia a sessão cair ao navegar
  // de uma página autenticada para uma página pública.
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
