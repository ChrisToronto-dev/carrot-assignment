import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

interface SessionContent {
  id?: number;
  username?: string;
}

export default async function getSession() {
  const session = await getIronSession<SessionContent>(cookies(), {
    cookieName: "delicious-tt",
    password: process.env.COOKIE_PASSWORD!,
  });
  return session;
}

export async function getSessionWithCookies(
  cookiesInstance: ReadonlyRequestCookies
) {
  const session = await getIronSession<SessionContent>(cookiesInstance, {
    cookieName: "delicious-tt",
    password: process.env.COOKIE_PASSWORD!,
  });
  return session;
}
