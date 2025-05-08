import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma"; // 상대 경로는 실제 파일 위치에 따라 조정해야 할 수 있습니다

const prisma = new PrismaClient();

// 타입 정의 - 결과를 명확하게 지정
interface Tweet {
  id: number;
  tweet: string;
  created_at: Date;
  user: {
    id: number;
    username: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

interface User {
  id: number;
  username: string;
  // 필요한 사용자 필드를 추가하세요
}

interface SearchResults {
  tweets: Tweet[];
  users: User[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const type = searchParams.get("type") || "all"; // 검색 타입: 'all', 'tweets', 'users'

  if (!query) {
    return NextResponse.json(
      { error: "검색어를 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    // 명시적으로 타입을 지정하여 초기화
    const results: SearchResults = { tweets: [], users: [] };

    // 트윗 검색 (내용 기반)
    if (type === "all" || type === "tweets") {
      const tweets = await prisma.tweet.findMany({
        where: {
          tweet: { contains: query },
        },
        select: {
          id: true,
          tweet: true,
          created_at: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
        take: 20,
      });

      results.tweets = tweets;
    }

    // 사용자 검색 (유저명, 바이오 기반)
    if (type === "all" || type === "users") {
      const users = await prisma.user.findMany({
        where: {
          OR: [{ username: { contains: query } }, { bio: { contains: query } }],
        },
        select: {
          id: true,
          username: true,
          bio: true,
          _count: {
            select: {
              tweets: true,
              likes: true,
            },
          },
        },
        take: 20,
      });

      results.users = users;
    }

    // 여기에 사용자 검색 로직을 추가할 수 있습니다 (type === "all" || type === "users")

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
