"use client";

import Button from "@/components/form-btn";
import Input from "@/components/form-input";
import { uploadProduct } from "@/app/actions";
import { useActionState } from "react";

export default function AddTweet() {
  const [state, action] = useActionState(uploadProduct, null);
  return (
    <div>
      <form action={action} className="flex flex-col gap-5">
        <Input
          name="tweet"
          required
          placeholder="생각을 공유해보세요."
          type="text"
          errors={state?.fieldErrors.tweet}
        />
        <Button text="작성 완료" />
      </form>
    </div>
  );
}
