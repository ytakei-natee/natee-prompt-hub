'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type Props = {
  promptId: string;
};

export default function CommentForm({ promptId }: Props) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || submitting) return;

    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('comments').insert({
        user_id: user.id,
        prompt_id: promptId,
        body: body.trim(),
      });
      setBody('');
      router.refresh();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="コメントを入力..."
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
      />
      <button
        type="submit"
        disabled={!body.trim() || submitting}
        className="rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50"
        style={{ backgroundColor: '#E8546B' }}
      >
        送信
      </button>
    </form>
  );
}
