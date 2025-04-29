import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface SessionContent {
  id?: number;
}

export default async function getSession() {
  const session = await getIronSession<SessionContent>(cookies(), {
    cookieName: "delicious-tt",
    password: process.env.COOKIE_PASSWORD!,
  });
  return session;
}
