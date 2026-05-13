import { NextRequest, NextResponse } from "next/server";
import { ingestAllSources } from "@/lib/news";

export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const cronHeader = request.headers.get("authorization");
  const manualHeader = request.headers.get("x-cron-secret");
  return (
    cronHeader === `Bearer ${process.env.CRON_SECRET}` ||
    manualHeader === process.env.CRON_SECRET
  );
}

// Vercel Cron Jobs chamam GET
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const result = await ingestAllSources();
  return NextResponse.json({ ok: true, ...result, timestamp: new Date().toISOString() });
}

// Chamada manual via curl
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const result = await ingestAllSources();
  return NextResponse.json({ ok: true, ...result, timestamp: new Date().toISOString() });
}
