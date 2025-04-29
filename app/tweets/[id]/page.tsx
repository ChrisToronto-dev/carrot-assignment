import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound } from "next/navigation";

async function getIsOwner(userId: number) {
  const session = await getSession();
  if (session.id) {
    return session.id === userId;
  }
  return false;
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

export default async function TweetDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const tweet = await getTweet(id);
  if (!tweet) {
    return notFound();
  }
  const isOwner = await getIsOwner(tweet.userId);
  return (
    <div>
      <div className="p-5 flex items-center gap-3 border-b border-neutral-700">
        <div>
          <h3>{tweet.user.username}</h3>
        </div>
      </div>
      <div className="p-5 flex justify-between">
        <p>{tweet.tweet}</p>
        {isOwner ? (
          <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">
            Delete tweet
          </button>
        ) : null}
      </div>
    </div>
  );
}
