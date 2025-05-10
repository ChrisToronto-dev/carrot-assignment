"use server";

import { z } from "zod";
import bcrypt from "bcrypt";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

const passwordRegex = new RegExp(/^(?=.*\d).*$/);

const formSchema = z.object({
  email: z.string().email().toLowerCase(),
  username: z.string().min(4, "Username must be at least 5 characters long"),
  password: z
    .string()
    .min(4)
    .regex(passwordRegex, "You must include at leat one number."),
});

export async function Login(prevState: any, formData: FormData) {
  const data = {
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  };

  console.log(data);
  const result = await formSchema.spa(data);
  console.log(result);
  if (!result.success) {
    return result.error.flatten();
  } else {
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
        password: true,
      },
    });
    const ok = await bcrypt.compare(
      result.data.password,
      user!.password ?? "xxxx"
    );
    if (ok) {
      const session = await getSession();
      session.id = user!.id;
      await session.save();
      redirect(`/user/${result.data.username}`);
    } else {
      return {
        fieldErrors: {
          password: ["Wrong password."],
          email: ["wrong email"],
          username: ["wrong username"],
        },
      };
    }
  }
}
