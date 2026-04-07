/**
 * AI研修_ロールモデル憑依プロンプト集.md をパースして seed.sql を生成する
 * 実行: npx tsx scripts/parse-prompts.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const MD_PATH = join(__dirname, '../../AI研修_ロールモデル憑依プロンプト集.md');
const OUT_PATH = join(__dirname, '../supabase/seed.sql');

const content = readFileSync(MD_PATH, 'utf-8');
const lines = content.split('\n');

type PromptData = {
  role: string;
  task: string;
  title: string;
  role_setting: string;
  background: string;
  task_description: string;
  constraints: string;
  output_format: string;
};

const prompts: PromptData[] = [];
let currentRole = '';
let currentTask = '';
let currentTitle = '';
let currentSection = '';
let sectionContent: string[] = [];
let promptData: Partial<PromptData> = {};

function flushSection() {
  if (!currentSection || !sectionContent.length) return;
  const text = sectionContent.join('\n').trim();
  switch (currentSection) {
    case '役割設定':
      promptData.role_setting = text;
      break;
    case '背景':
      promptData.background = text;
      break;
    case 'タスク':
      promptData.task_description = text;
      break;
    case '制約':
      promptData.constraints = text;
      break;
    case '出力形式':
      promptData.output_format = text;
      break;
  }
  sectionContent = [];
}

function flushPrompt() {
  flushSection();
  if (promptData.role_setting) {
    prompts.push({
      role: currentRole,
      task: currentTask,
      title: currentTitle,
      role_setting: promptData.role_setting || '',
      background: promptData.background || '',
      task_description: promptData.task_description || '',
      constraints: promptData.constraints || '',
      output_format: promptData.output_format || '',
    });
  }
  promptData = {};
  currentSection = '';
  sectionContent = [];
}

for (const line of lines) {
  // H1: 職種
  const roleMatch = line.match(/^# (Sales|Planner|Director|Casting)$/);
  if (roleMatch) {
    flushPrompt();
    currentRole = roleMatch[1];
    continue;
  }

  // H2: タスク
  const taskMatch = line.match(/^## 【\d+\.\s*(.+?)(?:（.+?）)?】$/);
  if (taskMatch) {
    flushPrompt();
    currentTask = taskMatch[1];
    currentTitle = taskMatch[1];
    continue;
  }

  // H3: セクション
  const sectionMatch = line.match(/^### (.+)$/);
  if (sectionMatch) {
    flushSection();
    currentSection = sectionMatch[1];
    continue;
  }

  // 区切り線はスキップ
  if (line.match(/^---$/)) continue;

  // コンテンツ蓄積
  if (currentSection) {
    sectionContent.push(line);
  }
}

// 最後のプロンプト
flushPrompt();

// SQL生成
function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}

const values = prompts
  .map(
    (p) =>
      `  ('${escapeSQL(p.role)}', '${escapeSQL(p.task)}', '${escapeSQL(p.title)}', '${escapeSQL(p.role_setting)}', '${escapeSQL(p.background)}', '${escapeSQL(p.task_description)}', '${escapeSQL(p.constraints)}', '${escapeSQL(p.output_format)}')`
  )
  .join(',\n');

const sql = `-- Natee Prompt Hub: シードデータ（AI研修プロンプト集から自動生成）
-- 生成日: ${new Date().toISOString().split('T')[0]}

INSERT INTO public.prompts (role, task, title, role_setting, background, task_description, constraints, output_format)
VALUES
${values}
;
`;

writeFileSync(OUT_PATH, sql, 'utf-8');
console.log(`${prompts.length}件のプロンプトをパースしました → ${OUT_PATH}`);
prompts.forEach((p) => console.log(`  - ${p.role} / ${p.task}`));
