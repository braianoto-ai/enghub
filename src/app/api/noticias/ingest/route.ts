import { NextRequest, NextResponse } from "next/server";
import { ingestAllSources } from "@/lib/news";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const result = await ingestAllSources();

  return NextResponse.json({
    ok: true,
    ...result,
    timestamp: new Date().toISOString(),
  });
}
