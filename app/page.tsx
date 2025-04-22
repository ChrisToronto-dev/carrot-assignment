"use client";

import FormButton from "@/components/form-btn";
import FormInput from "@/components/form-input";
import { handleForm } from "./action";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import { UserIcon } from "@heroicons/react/24/solid";
import { KeyIcon } from "@heroicons/react/24/solid";
import { useActionState } from "react";

export default function Home() {
  const [state, action] = useActionState(handleForm, null);

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
        />
        <FormInput
          name="username"
          type="text"
          placeholder="Username"
          required
          icon={<UserIcon className="size-6 fill-gray-400" />}
        />
        <FormInput
          name="password"
          type="password"
          placeholder="Password"
          required
          icon={<KeyIcon className="size-6 fill-gray-400" />}
        />
        {state?.errors && state.errors.length > 0 && (
          <div className="text-red-500 font-medium">
            {state.errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
        <FormButton text="Log in" />
        {state?.success && (
          <p className="text-green-500 font-medium p-4 bg-green-300 rounded-2xl">
            {state.success}
          </p>
        )}
      </form>
    </div>
  );
}
