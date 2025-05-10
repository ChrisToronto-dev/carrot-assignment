import db from "@/lib/db";
import { notFound } from "next/navigation";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";
import LikeButton from "@/components/like-button";
import CommentForm from "@/components/comment-form";
import { cookies } from "next/headers";
import { getSessionWithCookies } from "@/lib/session";
import { Metadata } from "next";

async function getIsOwner(userId: number, sessionId?: number) {
  if (sessionId) {
    return sessionId === userId;
  }
  return false;
}

async function getLikeStatus(tweetId: number, sessionId?: number) {
  let isLiked = false;

  if (sessionId) {
    const like = await db.like.findUnique({
      where: {
        id: {
          tweetId,
          userId: sessionId,
        },
      },
    });
    isLiked = Boolean(like);
  }

  const likeCount = await db.like.count({
    where: {
      tweetId,
    },
  });

  return {
    likeCount,
    isLiked,
  };
}

function getCachedLikeStatus(tweetId: number, sessionId?: number) {
  const cachedOperation = nextCache(
    (tweetId: number, sessionId?: number) => getLikeStatus(tweetId, sessionId),
    ["product-like-status"],
    {
      tags: [`like-status-${tweetId}`],
    }
  );
  return cachedOperation(tweetId, sessionId);
}

async function getTweet(id: number) {
  const tweet = await db.tweet.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });
  return tweet;
}

const getCachedPost = nextCache(getTweet, ["post-detail"], {
  tags: ["post-detail"],
  revalidate: 60,
});

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

async function getUsernameFromSession(sessionId?: number) {
  if (!sessionId) return null;

  const user = await db.user.findUnique({
    where: { id: sessionId },
    select: { username: true },
  });

  return user?.username || null;
}
// 메타데이터 함수 수정
export async function generateMetadata(props: any): Promise<Metadata> {
  const { params } = props;
  const resolvedParams = params instanceof Promise ? await params : params;
  const id = Number(resolvedParams.id);

  return {
    title: `Tweet ${id}`,
    description: `Details for tweet ${id}`,
  };
}

// 페이지 컴포넌트 수정 - any 타입 사용
export default async function TweetDetail(props: any) {
  const { params } = props;
  const resolvedParams = params instanceof Promise ? await params : params;
  const id = Number(resolvedParams.id);

  if (isNaN(id)) {
    return notFound();
  }

  const cookiesStore = cookies();
  const awaitedCookies =
    cookiesStore instanceof Promise ? await cookiesStore : cookiesStore;
  const session = await getSessionWithCookies(awaitedCookies);
  const sessionId = session.id;

  const tweet = await getCachedPost(id);
  if (!tweet) {
    return notFound();
  }

  const isOwner = await getIsOwner(tweet.userId, sessionId);
  const { likeCount, isLiked } = await getCachedLikeStatus(id, sessionId);
  const comments = await getCachedComments(id);
  const username = await getUsernameFromSession(sessionId);

  // JSX 부분은 변경 없음
  return (
    <div className="max-w-2xl mx-auto">
      {/* 기존 JSX 코드 */}
      <div className="p-5 flex items-center gap-3 border-b border-neutral-700">
        <div>
          <h3 className="font-bold">{tweet.user.username}</h3>
        </div>
      </div>

      <div className="p-5 border-b border-neutral-700">
        <p className="text-lg mb-4">{tweet.tweet}</p>

        <div className="flex justify-between items-center">
          <LikeButton isLiked={isLiked} likeCount={likeCount} tweetId={id} />

          {isOwner ? (
            <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">
              Delete tweet
            </button>
          ) : null}
        </div>
      </div>

      <div className="p-5">
        {sessionId && username ? (
          <CommentForm
            tweetId={id}
            initialComments={comments}
            username={username}
          />
        ) : (
          <div className="text-center text-neutral-500 py-5 border-t border-neutral-700">
            댓글을 작성하려면 로그인이 필요합니다.
          </div>
        )}
      </div>
    </div>
  );
}
