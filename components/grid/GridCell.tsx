import Link from 'next/link';

type Props = {
  role: string;
  task: string;
  index: number;
  count: number;
  accent: string;
};

export default function GridCell({ role, task, index, count, accent }: Props) {
  return (
    <Link
      href={`/prompts/${encodeURIComponent(role)}/${encodeURIComponent(task)}`}
      className="group flex items-center justify-between bg-white px-5 py-4 transition-colors hover:bg-[var(--background)]"
    >
      <span className="text-[13px] leading-snug">
        <span className="font-en font-light text-[var(--muted-light)] mr-1.5 text-[12px]">{index}.</span>
        <span className="font-[400]">{task}</span>
      </span>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {count > 0 && (
          <span className="font-en text-[10px] font-medium text-[var(--muted)]">
            {count}
          </span>
        )}
        <svg
          className="w-3 h-3 text-[var(--muted-light)]"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 4l4 4-4 4" />
        </svg>
      </div>
    </Link>
  );
}
