import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { Prisma } from "./generated/prisma-client";
import TweetList from "@/components/tweet-list";
import AddTweet from "@/components/add-tweet";

async function getUser() {
  const session = await getSession();
  console.log(session);
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
    });
    if (user) {
      return user;
    }
  }
  redirect("/login");
}

async function getInitialTweets() {
  const tweets = await db.tweet.findMany({
    orderBy: {
      created_at: "desc",
    },
    select: {
      tweet: true,
      created_at: true,
      id: true,
    },
  });
  return tweets;
}

export type InitialTweets = Prisma.PromiseReturnType<typeof getInitialTweets>;

export default async function Tweets() {
  const user = await getUser();
  console.log(user);
  const initialtweets = await getInitialTweets();
  console.log(initialtweets);
  return (
    <div className="">
      <AddTweet />
      <div className="mt-6">
        <h1 className="font-bold mb-3 text-2xl">모두의 이야기</h1>
        <TweetList initialTweets={initialtweets} />
      </div>
    </div>
  );
}
