import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { Prisma } from "./generated/prisma";
import TweetList from "@/components/tweet-list";
import { PlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
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
  notFound();
}

async function getInitialTweets() {
  const tweets = await db.tweet.findMany({
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
  const initialtweets = await getInitialTweets();
  console.log(initialtweets);
  return (
    <div className="p-10">
      <h1 className="text-black text-4xl text-center">tweets!</h1>
      <AddTweet />
      <div className="mt-6">
        <TweetList initialTweets={initialtweets} />
      </div>
    </div>
  );
}
