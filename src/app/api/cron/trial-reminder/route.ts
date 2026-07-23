import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTrialReminderEmail } from "@/lib/email";
import { isCronAuthorized } from "@/lib/cron-auth";

// Vercel Cron Job — runs daily at 09:00 UTC
// Config is in vercel.json

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find tenants whose trial ends in 2–4 days (2-day window to avoid missing if cron skips a day)
  const now = new Date();
  const windowStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString();

  const { data: tenants, error } = await supabase
    .from("tenants")
    .select("id, name, owner_id, trial_ends_at, trial_reminder_sent")
    .eq("plan", "PRO")
    .eq("status", "ACTIVE")
    .gte("trial_ends_at", windowStart)
    .lte("trial_ends_at", windowEnd)
    .eq("trial_reminder_sent", false);

  if (error) {
    console.error("cron/trial-reminder DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!tenants || tenants.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const tenant of tenants) {
    try {
      // Get owner email via auth admin
      const { data: userData } = await supabase.auth.admin.getUserById(tenant.owner_id);
      const email = userData?.user?.email;

      if (!email || !tenant.trial_ends_at) continue;

      await sendTrialReminderEmail({
        to: email,
        name: tenant.name,
        trialEndsAt: tenant.trial_ends_at,
      });

      // Mark reminder as sent
      await supabase
        .from("tenants")
        .update({ trial_reminder_sent: true })
        .eq("id", tenant.id);

      sent++;
    } catch (err) {
      console.error(`Failed to send reminder to tenant ${tenant.id}:`, err);
      errors.push(tenant.id);
    }
  }

  return NextResponse.json({ ok: true, sent, errors: errors.length ? errors : undefined });
}
