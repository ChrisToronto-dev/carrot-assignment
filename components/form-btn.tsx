"use client";

import { useFormStatus } from "react-dom";

interface FormButtonProps {
  text: string;
}

export default function FormButton({ text }: FormButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="rounded-full primary-btn p-4 bg-gray-300 cursor-pointer transform transition-transform hover:scale-105 duration-300 ease-in-out"
    >
      {pending ? "Loading ..." : text}
    </button>
  );
}
