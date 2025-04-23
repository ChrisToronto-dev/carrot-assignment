"use server";

import { z } from "zod";

const passwordRegex = new RegExp(/^(?=.*\d).*$/);

const formSchema = z.object({
  email: z
    .string()
    .email()
    .toLowerCase()
    .refine(
      (email) => email.endsWith("@zod.com"),
      "Only @zod.com emails are allowed"
    ),

  username: z.string().min(5, "Username must be at least 5 characters long"),
  password: z
    .string()
    .min(10)
    .regex(passwordRegex, "You must include at leat one number."),
});

export async function Login(prevState: any, formData: FormData) {
  const data = {
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const result = formSchema.safeParse(data);
  if (!result.success) {
    console.log("Zod Flattened Errors:", result.error.flatten());
    return result.error.flatten();
  } else {
    console.log(result.data);
  }
}
