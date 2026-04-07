import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);

    if (authError || !data.user) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // @natee.jp ドメインチェック
    const email = data.user.email ?? '';
    if (!email.endsWith('@natee.jp')) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=domain_restricted`);
    }

    // profiles upsert
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      display_name: data.user.user_metadata?.full_name ?? email.split('@')[0],
      avatar_url: data.user.user_metadata?.avatar_url ?? null,
    });

    return NextResponse.redirect(origin);
  }

  return NextResponse.redirect(`${origin}/login`);
}
