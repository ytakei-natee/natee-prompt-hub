'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  promptId: string;
  initialCount: number;
  initialLiked: boolean;
};

export default function LikeButton({ promptId, initialCount, initialLiked }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const handleToggle = async () => {
    if (pending) return;
    setPending(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => (newLiked ? c + 1 : Math.max(c - 1, 0)));
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc('toggle_like', { p_prompt_id: promptId });
      if (error) {
        setLiked(!newLiked);
        setCount((c) => (newLiked ? Math.max(c - 1, 0) : c + 1));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className={`font-en flex items-center gap-1.5 text-[11px] transition-colors ${
        liked ? 'text-rose-400' : 'text-[var(--muted-light)] hover:text-[var(--muted)]'
      }`}
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      {count}
    </button>
  );
}
