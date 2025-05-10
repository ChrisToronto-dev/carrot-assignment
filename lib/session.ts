import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

interface SessionContent {
  id?: number;
  username?: string;
}

export default async function getSession() {
  const cookiesStore = cookies();
  const awaitedCookies =
    cookiesStore instanceof Promise ? await cookiesStore : cookiesStore;

  const session = await getIronSession<SessionContent>(awaitedCookies, {
    cookieName: "delicious-tt",
    password: process.env.COOKIE_PASSWORD!,
  });
  return session;
}

// any 타입 사용
export async function getSessionWithCookies(cookiesInstance: any) {
  const resolvedCookies =
    cookiesInstance instanceof Promise
      ? await cookiesInstance
      : cookiesInstance;

  const session = await getIronSession<SessionContent>(resolvedCookies, {
    cookieName: "delicious-tt",
    password: process.env.COOKIE_PASSWORD!,
  });
  return session;
}
