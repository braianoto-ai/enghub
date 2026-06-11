import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // TEMP DEBUG: logar o erro real da troca de código
    console.error("[auth/callback] exchangeCodeForSession FALHOU:", error.status, error.code, error.message);
  } else {
    console.error("[auth/callback] sem 'code' na URL:", request.url);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
