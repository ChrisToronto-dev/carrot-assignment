import { unstable_cache as nextCache } from "next/cache";
import db from "@/lib/db";

type Comment = {
  id: number;
  content: string;
  created_at: Date;
  userId: number;
  user: {
    username: string;
  };
};

async function getComments(tweetId: number) {
  const comments = await db.comment.findMany({
    where: {
      tweetId,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return comments;
}

function getCachedComments(tweetId: number) {
  const cachedOperation = nextCache(
    (tweetId: number) => getComments(tweetId),
    ["tweet-comments"],
    {
      tags: [`comments-${tweetId}`],
      revalidate: 60,
    }
  );
  return cachedOperation(tweetId);
}

function formatDate(dateString: Date) {
  const date = new Date(dateString.toString());

  if (isNaN(date.getTime())) {
    return "날짜 정보 없음";
  }

  return new Intl.DateTimeFormat("ko", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function CommentList({ tweetId }: { tweetId: number }) {
  const comments = await getCachedComments(tweetId);

  if (comments.length === 0) {
    return (
      <div className="text-center text-neutral-500 py-5">
        아직 답글이 없습니다. 첫 번째 답글을 작성해보세요!
      </div>
    );
  }

  return (
    <div className="border-t border-neutral-700">
      <h3 className="font-medium text-lg py-3">답글 {comments.length}개</h3>
      <div className="space-y-4">
        {comments.map((comment: Comment) => (
          <div key={comment.id} className="border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{comment.user.username}</span>
              <span className="text-neutral-500 text-sm">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p className="whitespace-pre-wrap">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
