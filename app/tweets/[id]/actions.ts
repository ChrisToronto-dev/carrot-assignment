"use server";

import db from "@/lib/db";
import { z } from "zod";
import getSession from "@/lib/session";
import { revalidateTag, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function likePost(tweetId: number) {
  const session = await getSession();
  try {
    await db.like.create({
      data: {
        tweetId,
        userId: session.id!,
      },
    });
    revalidateTag(`like-status-${tweetId}`);
  } catch (e) {}
}

export async function dislikePost(tweetId: number) {
  try {
    const session = await getSession();
    await db.like.delete({
      where: {
        id: {
          tweetId,
          userId: session.id!,
        },
      },
    });
    revalidateTag(`like-status-${tweetId}`);
  } catch (e) {}
}

const commentSchema = z.object({
  content: z.string().min(1, "내용을 입력해주세요.").trim(),
});

export async function addComment(tweetId: number, formData: FormData) {
  const session = await getSession();

  if (!session.id) {
    return redirect("/login");
  }

  const data = {
    content: formData.get("content"),
  };

  const result = commentSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors.content?.[0] };
  }

  try {
    await db.comment.create({
      data: {
        content: result.data.content,
        tweetId,
        userId: session.id,
      },
    });

    revalidateTag(`comments-${tweetId}`);
    revalidatePath(`/tweets/${tweetId}`);

    return { success: true };
  } catch (error) {
    return { error: "댓글 작성 중 오류가 발생했습니다." };
  }
}

export async function deleteComment(commentId: number, tweetId: number) {
  const session = await getSession();

  try {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.userId !== session.id) {
      return { error: "삭제 권한이 없습니다." };
    }

    await db.comment.delete({
      where: { id: commentId },
    });

    revalidateTag(`comments-${tweetId}`);
    revalidatePath(`/tweets/${tweetId}`);

    return { success: true };
  } catch (error) {
    return { error: "댓글 삭제 중 오류가 발생했습니다." };
  }
}

export async function getTweetComments(tweetId: number) {
  try {
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

    revalidateTag(`comments-${tweetId}`);

    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}
