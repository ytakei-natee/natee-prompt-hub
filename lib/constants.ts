export const ROLES = ['Sales', 'Planner', 'Director', 'Casting'] as const;
export type Role = (typeof ROLES)[number];

export const TASKS: Record<Role, string[]> = {
  Sales: ['クライアントリサーチ', 'アポ前準備', '議事録整理', '提案書構成', '競合分析'],
  Planner: ['企画骨子ブレスト', '競合調査', 'ブリーフ分解', 'KPI設計', 'レポート'],
  Director: ['キャスティング評価', '撮影指示書', 'クリエイター打診文', '進行管理', '納品チェック'],
  Casting: ['選定軸整理', '候補リサーチ', '推薦文作成', '交渉メール', 'デモグラ分析'],
};

// 画像準拠のカラーテーマ
export const ROLE_COLORS: Record<Role, { bg: string; border: string; text: string; light: string }> = {
  Sales: {
    bg: 'bg-blue-600',
    border: 'border-blue-600',
    text: 'text-blue-600',
    light: 'bg-blue-50',
  },
  Planner: {
    bg: 'bg-teal-600',
    border: 'border-teal-600',
    text: 'text-teal-600',
    light: 'bg-teal-50',
  },
  Director: {
    bg: 'bg-purple-600',
    border: 'border-purple-600',
    text: 'text-purple-600',
    light: 'bg-purple-50',
  },
  Casting: {
    bg: 'bg-amber-700',
    border: 'border-amber-700',
    text: 'text-amber-700',
    light: 'bg-amber-50',
  },
};
