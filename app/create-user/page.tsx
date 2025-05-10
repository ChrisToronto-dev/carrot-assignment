"use client";

import FormButton from "@/components/form-btn";
import FormInput from "@/components/form-input";
import { createAccount } from "./actions";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import { UserIcon } from "@heroicons/react/24/solid";
import { KeyIcon } from "@heroicons/react/24/solid";
import { useActionState } from "react";

export default function CreateAccount() {
  const [state, dispatch] = useActionState(createAccount, null);
  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1 className="text-2xl">안녕하세요!</h1>
        <h2 className="text-xl">Fill in the form below to join!</h2>
      </div>
      <form action={dispatch} className="flex flex-col gap-3">
        <FormInput
          name="username"
          type="text"
          placeholder="Username"
          required
          icon={<UserIcon className="size-6 fill-gray-400" />}
          errors={state?.fieldErrors.username}
        />
        <FormInput
          name="email"
          type="email"
          placeholder="Email"
          required
          icon={<EnvelopeIcon className="size-6 fill-gray-400" />}
          errors={state?.fieldErrors.email}
        />
        <FormInput
          name="password"
          type="password"
          placeholder="Password"
          required
          icon={<KeyIcon className="size-6 fill-gray-400" />}
          errors={state?.fieldErrors.password}
        />
        <FormInput
          name="confirm_password"
          type="password"
          placeholder="Confirm Password"
          required
          icon={<KeyIcon className="size-6 fill-gray-400" />}
          errors={state?.fieldErrors.confirm_password}
        />
        <FormButton text="Create account" />
      </form>
    </div>
  );
}
