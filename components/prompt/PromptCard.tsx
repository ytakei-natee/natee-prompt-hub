'use client';

import type { Prompt } from '@/lib/types';
import CopyButton from './CopyButton';
import LikeButton from './LikeButton';
import Link from 'next/link';

type Props = {
  prompt: Prompt;
  liked: boolean;
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

export default function PromptCard({ prompt, liked }: Props) {
  const fullText = buildFullPrompt(prompt);

  return (
    <div className="group rounded-2xl bg-white shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)]">
      <div className="p-6 md:p-7">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <Link
            href={`/prompts/detail/${prompt.id}`}
            className="text-[15px] font-[600] leading-snug transition-colors hover:text-[var(--muted)]"
          >
            {prompt.title}
          </Link>
          <CopyButton text={fullText} />
        </div>

        {/* Preview */}
        <div className="mb-5 rounded-xl bg-[var(--background)] px-5 py-4">
          <p className="line-clamp-3 whitespace-pre-wrap text-[12px] font-[200] leading-[2] text-[var(--muted)]">
            {prompt.role_setting}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LikeButton
              promptId={prompt.id}
              initialCount={prompt.likes_count}
              initialLiked={liked}
            />
            <Link
              href={`/prompts/detail/${prompt.id}`}
              className="font-en flex items-center gap-1.5 text-[11px] text-[var(--muted-light)] transition hover:text-[var(--muted)]"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              {prompt.comments_count}
            </Link>
          </div>
          <span className="font-en text-[11px] font-[200] text-[var(--muted-light)] tracking-wide">
            {prompt.author?.display_name ?? 'Natee'}
          </span>
        </div>
      </div>
    </div>
  );
}
