import Header from '@/components/layout/Header';
import PromptCard from '@/components/prompt/PromptCard';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 自分の投稿
  const { data: myPrompts } = await supabase
    .from('prompts')
    .select('*, author:profiles(*)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  // いいねしたプロンプト
  const { data: likedRecords } = await supabase
    .from('likes')
    .select('prompt_id')
    .eq('user_id', user.id);

  const likedIds = likedRecords?.map((l) => l.prompt_id) ?? [];
  let likedPrompts: any[] = [];
  if (likedIds.length) {
    const { data } = await supabase
      .from('prompts')
      .select('*, author:profiles(*)')
      .in('id', likedIds);
    likedPrompts = data ?? [];
  }

  const likedSet = new Set(likedIds);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* プロフィール */}
        <div className="mb-8 flex items-center gap-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-14 w-14 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-lg text-gray-500">
              {profile?.display_name?.[0] ?? '?'}
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              {profile?.display_name}
            </h1>
            <p className="text-sm text-gray-400">{profile?.email}</p>
          </div>
        </div>

        {/* 自分の投稿 */}
        <section className="mb-10">
          <h2 className="mb-4 text-base font-semibold text-gray-700">
            投稿したプロンプト ({myPrompts?.length ?? 0})
          </h2>
          <div className="space-y-4">
            {myPrompts?.length ? (
              myPrompts.map((p) => (
                <PromptCard key={p.id} prompt={p} liked={likedSet.has(p.id)} />
              ))
            ) : (
              <p className="text-sm text-gray-400">まだ投稿がありません</p>
            )}
          </div>
        </section>

        {/* いいねしたプロンプト */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-gray-700">
            いいねしたプロンプト ({likedPrompts.length})
          </h2>
          <div className="space-y-4">
            {likedPrompts.length ? (
              likedPrompts.map((p) => (
                <PromptCard key={p.id} prompt={p} liked={true} />
              ))
            ) : (
              <p className="text-sm text-gray-400">
                まだいいねしていません
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
