import type { Comment } from '@/lib/types';

type Props = {
  comments: Comment[];
};

export default function CommentList({ comments }: Props) {
  if (!comments.length) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">
        コメントはまだありません
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-500">
            {comment.author?.display_name?.[0] ?? '?'}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-gray-700">
                {comment.author?.display_name ?? '不明'}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(comment.created_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-600">{comment.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
