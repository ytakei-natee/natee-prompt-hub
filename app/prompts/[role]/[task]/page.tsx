import Header from '@/components/layout/Header';
import PromptCard from '@/components/prompt/PromptCard';
import { createClient } from '@/lib/supabase/server';
import { type Role } from '@/lib/constants';
import Link from 'next/link';

const ACCENT_COLORS: Record<string, string> = {
  Sales: '#3b82f6',
  Planner: '#0d9488',
  Director: '#7c3aed',
  Casting: '#b45309',
};

type Props = {
  params: Promise<{ role: string; task: string }>;
};

export default async function PromptListPage({ params }: Props) {
  const { role: rawRole, task: rawTask } = await params;
  const role = decodeURIComponent(rawRole);
  const task = decodeURIComponent(rawTask);
  const accent = ACCENT_COLORS[role] ?? '#3b82f6';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: prompts } = await supabase
    .from('prompts')
    .select('*, author:profiles(*)')
    .eq('role', role)
    .eq('task', task)
    .order('likes_count', { ascending: false });

  let likedSet = new Set<string>();
  if (user && prompts?.length) {
    const promptIds = prompts.map((p: any) => p.id);
    const { data: likes } = await supabase
      .from('likes')
      .select('prompt_id')
      .eq('user_id', user.id)
      .in('prompt_id', promptIds);
    likedSet = new Set(likes?.map((l: any) => l.prompt_id) ?? []);
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Subtle accent gradient */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-[30%] -right-[15%] w-[50vw] h-[50vw] rounded-full blur-3xl opacity-[.08]"
          style={{ background: accent }}
        />
      </div>

      <main className="relative z-10 mx-auto max-w-3xl px-6 md:px-10 py-10 md:py-14">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-light text-gray-400 transition hover:text-gray-600 mb-8 group">
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-[2px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12l-4-4 4-4"/>
          </svg>
          トップに戻る
        </Link>

        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="rounded-full px-3.5 py-1 text-[12px] font-semibold text-white tracking-wide"
              style={{ backgroundColor: accent }}
            >
              {role}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800 mb-2">
            {task}
          </h1>
          <p className="text-[13px] font-light text-[var(--muted)]">
            {prompts?.length ?? 0}件のプロンプト
          </p>
        </div>

        {/* Add button */}
        <div className="mb-8 animate-fade-up delay-1">
          <Link
            href={`/prompts/new?role=${encodeURIComponent(role)}&task=${encodeURIComponent(task)}`}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-[var(--accent-hover)] hover:shadow-md hover:-translate-y-[1px]"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 3v10M3 8h10"/>
            </svg>
            プロンプトを追加
          </Link>
        </div>

        {/* Prompt cards */}
        <div className="space-y-5">
          {prompts?.length ? (
            prompts.map((prompt: any, i: number) => (
              <div key={prompt.id} className={`animate-fade-up delay-${Math.min(i + 1, 5)}`}>
                <PromptCard prompt={prompt} liked={likedSet.has(prompt.id)} />
              </div>
            ))
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center animate-fade-up">
              <div className="mb-3 text-3xl">✨</div>
              <p className="text-[14px] font-light text-gray-400 mb-4">
                まだプロンプトがありません
              </p>
              <Link
                href={`/prompts/new?role=${encodeURIComponent(role)}&task=${encodeURIComponent(task)}`}
                className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-600 transition hover:text-gray-900"
              >
                最初のプロンプトを投稿する
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
