import { createBrowserClient } from '@supabase/ssr';

// Supabase未設定時のモック（開発プレビュー用）
function createMockClient() {
  const noop = () => ({ data: [], error: null });
  const chain: any = new Proxy({}, {
    get: () => (...args: any[]) => chain,
  });
  return {
    from: () => ({
      select: (...a: any[]) => ({
        data: [], error: null,
        eq: () => ({ data: [], error: null, single: () => ({ data: null, error: null }), maybeSingle: () => ({ data: null, error: null }), order: () => ({ data: [], error: null }), in: () => ({ data: [], error: null }) }),
        order: () => ({ data: [], error: null }),
        or: () => ({ data: [], error: null, order: () => ({ data: [], error: null, limit: () => ({ data: [], error: null }) }) }),
      }),
      insert: noop,
      upsert: noop,
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithOAuth: async () => ({ data: null, error: null }),
      signOut: async () => ({}),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    rpc: async () => ({ data: null, error: null }),
  } as any;
}

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return createMockClient();
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
