import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Supabase未設定時のモッククライアント（開発プレビュー用）
function createMockClient() {
  return {
    from: () => ({
      select: () => ({ data: [], error: null, eq: () => ({ data: [], error: null, single: () => ({ data: null, error: null }), maybeSingle: () => ({ data: null, error: null }), order: () => ({ data: [], error: null }), in: () => ({ data: [], error: null }) }), order: () => ({ data: [], error: null, eq: () => ({ data: [], error: null }) }), or: () => ({ data: [], error: null, order: () => ({ data: [], error: null, limit: () => ({ data: [], error: null }) }) }) }),
      insert: () => ({ data: null, error: null }),
      upsert: () => ({ data: null, error: null }),
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({}),
    },
    rpc: async () => ({ data: null, error: null }),
  } as any;
}

export async function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createMockClient();
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component からの呼び出し時は set が使えないため無視
          }
        },
      },
    }
  );
}
