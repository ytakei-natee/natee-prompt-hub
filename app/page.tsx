import Header from '@/components/layout/Header';
import PromptGrid from '@/components/grid/PromptGrid';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: rawCounts } = await supabase
    .from('prompts')
    .select('role, task');

  const countMap = new Map<string, number>();
  rawCounts?.forEach((row) => {
    const key = `${row.role}__${row.task}`;
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  });

  const counts = Array.from(countMap.entries()).map(([key, count]) => {
    const [role, task] = key.split('__');
    return { role, task, count };
  });

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-[1200px] px-8 md:px-12 pt-16 pb-24">
        {/* Hero */}
        <div className="mb-20 animate-fade-up">
          <p className="font-en text-[11px] tracking-[.15em] uppercase text-[var(--muted)] mb-6">
            Natee Prompt Hub
          </p>
          <h1 className="text-[clamp(28px,4vw,44px)] leading-[1.25] tracking-[-.01em] mb-5">
            職種別プロンプトを、<br />
            チームで蓄積する。
          </h1>
          <p className="text-[15px] font-[200] text-[var(--muted)] max-w-[420px] leading-[1.9]">
            各業務をクリックして、プロンプトを閲覧・追加できます。
          </p>
        </div>

        {/* Grid */}
        <PromptGrid counts={counts} />
      </main>
    </div>
  );
}
