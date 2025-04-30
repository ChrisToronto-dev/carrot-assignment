"use server";

import db from "@/lib/db";
import { z } from "zod";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

export async function getMoreTweets(page: number) {
  const tweetsPerPage = 1;
  const skip = page * tweetsPerPage;

  try {
    const tweets = await db.tweet.findMany({
      select: {
        tweet: true,
        created_at: true,
        id: true,
      },
      skip: skip,
      take: tweetsPerPage,
      orderBy: {
        created_at: "desc",
      },
    });

    console.log(
      `Fetched tweets for page ${page}, skip: ${skip}, count: ${tweets.length}`
    );
    return tweets;
  } catch (error) {
    console.error("Error fetching tweets:", error);
    throw error;
  }
}

const tweetSchema = z.object({
  tweet: z.string({
    required_error: "내용을 적어주세요.",
  }),
});

export async function uploadProduct(_: any, formData: FormData) {
  const data = {
    tweet: formData.get("tweet"),
  };

  const result = tweetSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const session = await getSession();
    if (session.id) {
      const tweet = await db.tweet.create({
        data: {
          tweet: result.data.tweet,
          user: {
            connect: {
              id: session.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
    }
  }
}
