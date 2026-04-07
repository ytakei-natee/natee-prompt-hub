import Header from '@/components/layout/Header';
import CopyButton from '@/components/prompt/CopyButton';
import LikeButton from '@/components/prompt/LikeButton';
import CommentList from '@/components/comment/CommentList';
import CommentForm from '@/components/comment/CommentForm';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Prompt } from '@/lib/types';

const ACCENT_COLORS: Record<string, string> = {
  Sales: '#3b82f6',
  Planner: '#0d9488',
  Director: '#7c3aed',
  Casting: '#b45309',
};

type Props = {
  params: Promise<{ id: string }>;
};

function buildFullPrompt(p: Prompt): string {
  const sections = [
    p.role_setting && `### 役割設定\n${p.role_setting}`,
    p.background && `### 背景\n${p.background}`,
    p.task_description && `### タスク\n${p.task_description}`,
    p.constraints && `### 制約\n${p.constraints}`,
    p.output_format && `### 出力形式\n${p.output_format}`,
  ].filter(Boolean);
  return sections.join('\n\n');
}

export default async function PromptDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: prompt } = await supabase
    .from('prompts')
    .select('*, author:profiles(*)')
    .eq('id', id)
    .single();

  if (!prompt) notFound();

  const accent = ACCENT_COLORS[prompt.role] ?? '#3b82f6';
  const { data: { user } } = await supabase.auth.getUser();

  let liked = false;
  if (user) {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('prompt_id', id)
      .maybeSingle();
    liked = !!data;
  }

  const { data: comments } = await supabase
    .from('comments')
    .select('*, author:profiles(*)')
    .eq('prompt_id', id)
    .order('created_at', { ascending: true });

  const fullText = buildFullPrompt(prompt);

  const sections = [
    { label: '役割設定', icon: '👤', content: prompt.role_setting },
    { label: '背景', icon: '📋', content: prompt.background },
    { label: 'タスク', icon: '📝', content: prompt.task_description },
    { label: '制約', icon: '⚠️', content: prompt.constraints },
    { label: '出力形式', icon: '📊', content: prompt.output_format },
  ].filter((s) => s.content);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="relative z-10 mx-auto max-w-3xl px-6 md:px-10 py-10 md:py-14">
        {/* Back */}
        <Link
          href={`/prompts/${encodeURIComponent(prompt.role)}/${encodeURIComponent(prompt.task)}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-light text-gray-400 transition hover:text-gray-600 mb-8 group"
        >
          <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-[2px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12l-4-4 4-4"/>
          </svg>
          {prompt.role} / {prompt.task}
        </Link>

        {/* Header card */}
        <div className="mb-8 rounded-2xl bg-white border border-[var(--border)] shadow-[var(--shadow-sm)] p-7 animate-fade-up">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span
                  className="rounded-full px-3 py-0.5 text-[11px] font-semibold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {prompt.role}
                </span>
                <span className="text-[12px] font-light text-gray-400">
                  {prompt.task}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-800">
                {prompt.title}
              </h1>
            </div>
            <CopyButton text={fullText} />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[12px] font-light text-gray-400">
              {prompt.author?.display_name ?? 'Natee公式'}
            </span>
            <span className="text-[11px] font-light text-gray-300">
              {new Date(prompt.created_at).toLocaleDateString('ja-JP')}
            </span>
          </div>
        </div>

        {/* Prompt sections */}
        <div className="space-y-4 mb-10">
          {sections.map((section, i) => (
            <div
              key={section.label}
              className={`rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)] overflow-hidden animate-fade-up delay-${Math.min(i + 1, 5)}`}
            >
              <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-3">
                <span className="text-[13px]">{section.icon}</span>
                <h3 className="text-[13px] font-semibold text-gray-600 tracking-wide">
                  {section.label}
                </h3>
              </div>
              <div className="px-6 py-5">
                <pre className="whitespace-pre-wrap text-[13px] leading-[1.9] text-gray-600 font-light font-[inherit]">
                  {section.content}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mb-12 animate-fade-up">
          <LikeButton
            promptId={prompt.id}
            initialCount={prompt.likes_count}
            initialLiked={liked}
          />
        </div>

        {/* Comments */}
        <div className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)] p-6 animate-fade-up">
          <h3 className="text-[14px] font-semibold text-gray-700 mb-5">
            コメント
            <span className="ml-2 text-[12px] font-light text-gray-400">
              {comments?.length ?? 0}
            </span>
          </h3>
          <CommentList comments={comments ?? []} />
          <div className="mt-5 border-t border-[var(--border)] pt-5">
            <CommentForm promptId={prompt.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
