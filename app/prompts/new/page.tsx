'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ROLES, TASKS, ROLE_COLORS, type Role } from '@/lib/constants';
import Header from '@/components/layout/Header';

function NewPromptForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') ?? 'Sales');
  const [task, setTask] = useState(searchParams.get('task') ?? '');
  const [title, setTitle] = useState('');
  const [roleSetting, setRoleSetting] = useState('');
  const [background, setBackground] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !roleSetting.trim()) {
      setError('タイトルと役割設定は必須です');
      return;
    }

    setSubmitting(true);
    setError('');

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('ログインが必要です');
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from('prompts').insert({
      author_id: user.id,
      role,
      task: task || TASKS[role as Role][0],
      title: title.trim(),
      role_setting: roleSetting.trim(),
      background: background.trim(),
      task_description: taskDescription.trim(),
      constraints: constraints.trim(),
      output_format: outputFormat.trim(),
    });

    if (insertError) {
      setError('投稿に失敗しました。もう一度お試しください。');
      setSubmitting(false);
      return;
    }

    router.push(
      `/prompts/${encodeURIComponent(role)}/${encodeURIComponent(task || TASKS[role as Role][0])}`
    );
  };

  const currentTasks = TASKS[role as Role] ?? TASKS.Sales;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold text-gray-800">
          プロンプトを投稿
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 職種 × 業務 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                職種
              </label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setTask('');
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                業務
              </label>
              <select
                value={task || currentTasks[0]}
                onChange={(e) => setTask(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {currentTasks.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* タイトル */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 化粧品ブランド向けクライアントリサーチ"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* 役割設定 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              役割設定
            </label>
            <textarea
              value={roleSetting}
              onChange={(e) => setRoleSetting(e.target.value)}
              rows={4}
              placeholder="あなたは〜の専門家です。..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* 背景 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              背景（テンプレート変数含む）
            </label>
            <textarea
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              rows={4}
              placeholder="- クライアント名：[例：花王]&#10;- 予算感：[例：300万円]"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* タスク */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              タスク（指示内容）
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={4}
              placeholder="以下の流れで実施してください。&#10;1. ...&#10;2. ..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* 制約 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              制約
            </label>
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              rows={3}
              placeholder="- 推測は仮説と明記する&#10;- 専門用語は噛み砕く"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* 出力形式 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              出力形式
            </label>
            <textarea
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              rows={2}
              placeholder="箇条書き形式で出力"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#E8546B' }}
            >
              {submitting ? '投稿中...' : '投稿する'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              キャンセル
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export default function NewPromptPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">読み込み中...</div>}>
      <NewPromptForm />
    </Suspense>
  );
}
