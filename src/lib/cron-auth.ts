import { NextRequest } from "next/server";

export function isCronAuthorized(request: NextRequest): boolean {
  const cronHeader = request.headers.get("authorization");
  const manualHeader = request.headers.get("x-cron-secret");
  return (
    cronHeader === `Bearer ${process.env.CRON_SECRET}` ||
    manualHeader === process.env.CRON_SECRET
  );
}
