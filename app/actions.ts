"use server";

import db from "@/lib/db";

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
