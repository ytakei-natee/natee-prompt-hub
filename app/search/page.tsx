import Header from '@/components/layout/Header';
import PromptCard from '@/components/prompt/PromptCard';
import { createClient } from '@/lib/supabase/server';

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let prompts: any[] = [];
  if (query) {
    const pattern = `%${query}%`;
    const { data } = await supabase
      .from('prompts')
      .select('*, author:profiles(*)')
      .or(
        `title.ilike.${pattern},role_setting.ilike.${pattern},task_description.ilike.${pattern},background.ilike.${pattern}`
      )
      .order('likes_count', { ascending: false })
      .limit(50);
    prompts = data ?? [];
  }

  // いいね状態
  let likedSet = new Set<string>();
  if (user && prompts.length) {
    const { data: likes } = await supabase
      .from('likes')
      .select('prompt_id')
      .eq('user_id', user.id)
      .in(
        'prompt_id',
        prompts.map((p) => p.id)
      );
    likedSet = new Set(likes?.map((l) => l.prompt_id) ?? []);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-xl font-bold text-gray-800">検索結果</h1>
        {query && (
          <p className="mb-6 text-sm text-gray-500">
            「{query}」で {prompts.length}件ヒット
          </p>
        )}

        {!query && (
          <p className="py-12 text-center text-sm text-gray-400">
            ヘッダーの検索バーからキーワードを入力してください
          </p>
        )}

        <div className="space-y-4">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              liked={likedSet.has(prompt.id)}
            />
          ))}
        </div>

        {query && prompts.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-400">
            該当するプロンプトが見つかりませんでした
          </p>
        )}
      </main>
    </>
  );
}
