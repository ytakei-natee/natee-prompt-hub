import { ROLES, TASKS, type Role } from '@/lib/constants';
import type { GridCount } from '@/lib/types';
import GridCell from './GridCell';

type Props = {
  counts: GridCount[];
};

const COLUMN_STYLES: Record<Role, { header: string; accent: string }> = {
  Sales: { header: 'bg-[#3b82f6]', accent: '#3b82f6' },
  Planner: { header: 'bg-[#0d9488]', accent: '#0d9488' },
  Director: { header: 'bg-[#7c3aed]', accent: '#7c3aed' },
  Casting: { header: 'bg-[#92400e]', accent: '#92400e' },
};

export default function PromptGrid({ counts }: Props) {
  const getCount = (role: string, task: string) => {
    return counts.find((c) => c.role === role && c.task === task)?.count ?? 0;
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
      {ROLES.map((role, colIdx) => {
        const styles = COLUMN_STYLES[role];
        return (
          <div
            key={role}
            className={`animate-fade-up delay-${colIdx + 1} overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]`}
          >
            {/* Column Header */}
            <div className={`${styles.header} px-5 py-4`}>
              <span className="font-en text-[13px] font-semibold tracking-[.08em] text-white">
                {role}
              </span>
            </div>

            {/* Task List */}
            <div className="flex flex-col gap-[1px] bg-[var(--border)] p-0">
              {TASKS[role].map((task, index) => (
                <GridCell
                  key={task}
                  role={role}
                  task={task}
                  index={index + 1}
                  count={getCount(role, task)}
                  accent={styles.accent}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
