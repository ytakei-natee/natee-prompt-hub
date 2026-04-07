'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Profile } from '@/lib/types';

export default function Header() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-[var(--border)]">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-8 md:px-12">
        {/* Logo */}
        <a href="/" className="flex items-center gap-4">
          <svg viewBox="0 0 200 100" className="h-[22px] w-auto" fill="none">
            <path d="M10 95V30L45 5h145v90H10z" stroke="currentColor" strokeWidth="5" fill="none"/>
            <text x="22" y="82" fontFamily="Inter,sans-serif" fontSize="52" fontWeight="700" fill="currentColor">Natee</text>
          </svg>
          <span className="hidden sm:inline font-en text-[11px] tracking-[.1em] uppercase text-[var(--muted-light)]">
            Prompt Hub
          </span>
        </a>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-[260px] mx-10">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[var(--muted-light)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索"
              className="w-full rounded-lg bg-white/50 border border-[var(--border)] pl-10 pr-4 py-[7px] text-[13px] font-[200] outline-none placeholder:text-[var(--muted-light)] focus:border-[var(--border-strong)] focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <a
            href="/prompts/new"
            className="font-en flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-[7px] text-[12px] tracking-[.04em] font-medium text-white transition-all hover:bg-[var(--accent-hover)]"
          >
            投稿する
          </a>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white border border-[var(--border)] transition hover:border-[var(--border-strong)]"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-[11px] text-[var(--muted)]">
                  {profile?.display_name?.[0] ?? '?'}
                </span>
              )}
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-50 mt-3 w-52 rounded-xl border border-[var(--border)] bg-white p-1.5 shadow-[var(--shadow-lg)] animate-fade-in">
                  <div className="px-3 py-2.5">
                    <p className="text-[13px] font-[600] truncate">{profile?.display_name}</p>
                    <p className="text-[11px] font-[200] text-[var(--muted)] truncate">{profile?.email}</p>
                  </div>
                  <div className="h-px bg-[var(--border)] mx-2 my-1" />
                  <a href="/profile" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-[var(--foreground)]">
                    マイページ
                  </a>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--muted)] transition hover:bg-[var(--background)] hover:text-[var(--foreground)]">
                    ログアウト
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
