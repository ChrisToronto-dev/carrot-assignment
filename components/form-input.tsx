import React, { InputHTMLAttributes } from "react";

interface InputProps {
  name: string;
  errors?: string[];
  icon: React.ReactNode;
}

export default function Input({
  name,
  errors = [],
  icon,
  ...rest
}: InputProps & InputHTMLAttributes<HTMLInputElement>) {
  console.log(rest);
  return (
    <>
      <div className="flex items-center relative border-gray-300 border-2 rounded-full pl-4">
        {icon}
        <input
          name={name}
          className="bg-transparent p-4 pl-2 w-full focus:outline-none placeholder:text-neutral-400"
          {...rest}
        />
      </div>
      {errors.map((error, index) => (
        <span key={index} className="text-red-500 font-medium">
          {error}
        </span>
      ))}
    </>
  );
}
