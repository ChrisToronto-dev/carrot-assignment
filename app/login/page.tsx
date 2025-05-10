"use client";

import FormButton from "@/components/form-btn";
import FormInput from "@/components/form-input";
import { Login } from "./action";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import { UserIcon } from "@heroicons/react/24/solid";
import { KeyIcon } from "@heroicons/react/24/solid";
import { useActionState } from "react";
import Link from "next/link";

export default function Home() {
  const [state, action] = useActionState(Login, null);

  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="mt-10 flex gap-2 *:font-medium justify-center items-center">
        <div className="text-8xl">🔥</div>
      </div>
      <form action={action} className="flex flex-col gap-3">
        <FormInput
          name="email"
          type="email"
          placeholder="Email"
          required
          icon={<EnvelopeIcon className="size-6 fill-gray-400" />}
          errors={state?.fieldErrors.email}
        />
        <FormInput
          name="username"
          type="text"
          placeholder="Username"
          required
          minLength={4}
          icon={<UserIcon className="size-6 fill-gray-400" />}
          errors={state?.fieldErrors.username}
        />
        <FormInput
          name="password"
          type="password"
          placeholder="Password"
          minLength={4}
          required
          icon={<KeyIcon className="size-6 fill-gray-400" />}
          errors={state?.fieldErrors.password}
        />
        <FormButton text="Log in" />
      </form>
      <div className="flex justify-center items-center">
        <p className="mr-4">아이디가 없으신가요? </p>
        <Link href="/create-user">
          <p className="text-lg">회원가입</p>
        </Link>
      </div>
    </div>
  );
}
