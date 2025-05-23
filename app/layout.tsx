import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import getSession from "@/lib/session";
import db from "@/lib/db";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { HomeIcon } from "@heroicons/react/24/solid";
import { UserIcon } from "@heroicons/react/24/solid";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carrot Tweet",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 사용자 세션 가져오기
  const session = await getSession();
  let username = null;

  // 로그인된 사용자가 있으면 username 가져오기
  if (session?.id) {
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { username: true },
    });
    username = user?.username;
  }

  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-white text-black max-w-screen-sm mx-auto`}
      >
        <header className="mt-4 bg-orange-500 rounded-full px-4 py-3 ">
          <nav className="flex justify-between items-center">
            <div className="font-bold text-xl">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                CarrotPost
              </Link>
            </div>
            <ul className="flex items-center space-x-6">
              <li>
                <Link
                  href="/"
                  className="hover:text-blue-600 transition-colors"
                >
                  <HomeIcon className="size-8" />
                </Link>
              </li>
              {username ? (
                <li>
                  <Link
                    href={`/user/${username}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    <UserIcon className="size-8" />
                  </Link>
                </li>
              ) : (
                ""
              )}
              <li>
                <div className="search-bar">
                  <Link
                    href="/search"
                    className="hover:text-blue-600 transition-colors"
                  >
                    <MagnifyingGlassIcon className="size-8" />
                  </Link>
                </div>
              </li>
            </ul>
          </nav>
        </header>
        <main className="px-4 py-4">{children}</main>
      </body>
    </html>
  );
}
