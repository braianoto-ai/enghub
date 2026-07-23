import { NextRequest, NextResponse } from "next/server";
import { ingestAllSources } from "@/lib/news";
import { isCronAuthorized } from "@/lib/cron-auth";

export const maxDuration = 60;

// Vercel Cron Jobs chamam GET
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const result = await ingestAllSources();
  return NextResponse.json({ ok: true, ...result, timestamp: new Date().toISOString() });
}

// Chamada manual via curl
export async function POST(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const result = await ingestAllSources();
  return NextResponse.json({ ok: true, ...result, timestamp: new Date().toISOString() });
}
