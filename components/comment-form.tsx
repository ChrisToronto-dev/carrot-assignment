"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addComment } from "@/app/tweets/[id]/actions";
import { useOptimistic, useTransition } from "react";

interface Comment {
  id: number;
  content: string;
  created_at: Date;
  user: {
    username: string;
  };
}

interface CommentFormProps {
  tweetId: number;
  initialComments: Comment[];
  username: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="bg-blue-500 px-5 py-2 rounded-md text-white font-medium disabled:opacity-70"
    >
      {pending ? "게시 중..." : "답글 작성"}
    </button>
  );
}

export default function CommentForm({
  tweetId,
  initialComments,
  username,
}: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [commentContent, setCommentContent] = useState("");

  const [optimisticComments, addOptimisticComment] = useOptimistic<
    Comment[],
    string
  >(initialComments, (state, newContent) => [
    {
      id: Math.random() * -1000000,
      content: newContent,
      created_at: new Date(),
      user: {
        username: username,
      },
    },
    ...state,
  ]);

  const handleSubmit = async (formData: FormData) => {
    const content = formData.get("content") as string;

    if (!content || content.trim() === "") return;

    startTransition(() => {
      addOptimisticComment(content);
    });

    formRef.current?.reset();
    setCommentContent("");

    await addComment(tweetId, formData);
  };

  return (
    <div className="border-t border-neutral-700 py-5">
      <form ref={formRef} action={handleSubmit}>
        <div className="flex flex-col gap-3">
          <textarea
            name="content"
            required
            placeholder="답글을 남겨보세요..."
            className="border border-neutral-700 bg-black text-white rounded-md p-2 resize-none h-24"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </div>
      </form>

      <div className="mt-8 border-t border-neutral-700">
        <h3 className="font-medium text-lg py-3">
          답글 {optimisticComments.length}개
        </h3>

        <div className="space-y-4">
          {optimisticComments.length === 0 ? (
            <div className="text-center text-neutral-500 py-5">
              아직 답글이 없습니다. 첫 번째 답글을 작성해보세요!
            </div>
          ) : (
            optimisticComments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-neutral-800 pb-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{comment.user.username}</span>
                  <span className="text-neutral-500 text-sm">
                    {comment.id < 0
                      ? "방금 전"
                      : formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
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
