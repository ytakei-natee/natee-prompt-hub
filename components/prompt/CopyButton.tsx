'use client';

import { useState } from 'react';

type Props = {
  text: string;
  className?: string;
};

export default function CopyButton({ text, className = '' }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`font-en flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] tracking-[.02em] transition-all ${
        copied
          ? 'border-emerald-200 bg-emerald-50/50 text-emerald-600'
          : 'border-[var(--border)] bg-transparent text-[var(--muted-light)] hover:text-[var(--muted)] hover:border-[var(--border-strong)]'
      } ${className}`}
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13.25 4.75l-6.5 6.5-3-3"/></svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          Copy
        </>
      )}
    </button>
  );
}
