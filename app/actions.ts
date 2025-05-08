"use server";

import db from "@/lib/db";
import { z } from "zod";
import getSession from "@/lib/session";
import { revalidatePath } from "next/cache";

export interface UserProfile {
  id: number;
  username: string;
  email?: string | null;
  bio: string | null;
  created_at: Date;
  _count: {
    tweets: number;
  };
}

export type InitialTweets = {
  id: number;
  tweet: string;
  created_at: Date;
  updated_at: Date;
  userId: number;
  user?: {
    id: number;
    username: string;
    bio: string | null;
  };
}[];

export interface TweetWithUser {
  id: number;
  tweet: string;
  created_at: Date;
  updated_at: Date;
  userId: number;
  user: {
    id: number;
    username: string;
    bio: string | null;
  };
}

// Get user profile with tweet count - now using username
export async function getUserProfile(
  username: string
): Promise<UserProfile | null> {
  try {
    const user = await db.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        created_at: true,
        _count: {
          select: {
            tweets: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

// Get tweets by username with pagination
export async function getUserTweets(
  username: string,
  page = 0,
  limit = 5
): Promise<InitialTweets> {
  try {
    // First get the user ID from the username
    const user = await db.user.findUnique({
      where: {
        username: username,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return [];
    }

    const tweets = await db.tweet.findMany({
      where: {
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            bio: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip: page * limit,
      take: limit,
    });

    return tweets as InitialTweets;
  } catch (error) {
    console.error("Error fetching user tweets:", error);
    return [];
  }
}

// Get more tweets for infinite scrolling or pagination - now using username
export async function getMoreUserTweets(
  username: string,
  page: number
): Promise<InitialTweets> {
  try {
    return await getUserTweets(username, page);
  } catch (error) {
    console.error("Error fetching more user tweets:", error);
    return [];
  }
}

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

      revalidatePath("/");
    }
  }
}
