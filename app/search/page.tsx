"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import FormButton from "@/components/form-btn";
import FormInput from "@/components/form-input";

interface TweetResult {
  id: number;
  tweet: string;
  created_at: string;
  user: {
    id: number;
    username: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

interface UserResult {
  id: number;
  username: string;
  bio?: string;
  _count: {
    tweets: number;
    likes: number;
  };
}

interface SearchResults {
  tweets: TweetResult[];
  users: UserResult[];
}

// 검색 기능을 담당하는 컴포넌트
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";

  const [searchTerm, setSearchTerm] = useState(query);
  const [searchType, setSearchType] = useState(type);
  const [results, setResults] = useState<SearchResults>({
    tweets: [],
    users: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 검색어나 타입이 변경될 때마다 검색 수행
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults({ tweets: [], users: [] });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&type=${searchType}`
        );

        if (!response.ok) {
          throw new Error("검색 중 오류가 발생했습니다.");
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "검색 중 오류가 발생했습니다."
        );
        setResults({ tweets: [], users: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, searchType]);

  // 새 검색 제출 처리
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (searchTerm.trim()) {
      // 새 검색어로 URL 업데이트
      router.push(
        `/search?q=${encodeURIComponent(searchTerm.trim())}&type=${searchType}`
      );
    }
  };

  // 검색 타입 변경 처리
  const handleTypeChange = (type: string) => {
    setSearchType(type);
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 검색창 추가 */}
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-lg">
          <div className="flex mb-2">
            <FormInput
              type="text"
              name="searchtext"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="검색어를 입력하세요..."
            />

            <FormButton text="submit" />
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleTypeChange("all")}
              className={`px-3 py-1 rounded ${
                searchType === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100"
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("tweets")}
              className={`px-3 py-1 rounded ${
                searchType === "tweets"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100"
              }`}
            >
              트윗
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("users")}
              className={`px-3 py-1 rounded ${
                searchType === "users"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100"
              }`}
            >
              사용자
            </button>
          </div>
        </form>
      </div>

      <h1 className="text-2xl font-bold mb-6">검색 결과: {query}</h1>

      {loading && <p>검색 중...</p>}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        results.tweets.length === 0 &&
        results.users.length === 0 &&
        query && <p>검색 결과가 없습니다.</p>}

      {/* 사용자 결과 */}
      {results.users.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">사용자</h2>
          <div className="space-y-4">
            {results.users.map((user) => (
              <div key={user.id} className="border p-4 rounded-lg">
                <Link
                  href={`/profile/${user.id}`}
                  className="text-xl font-semibold text-blue-600 hover:underline"
                >
                  @{user.username}
                </Link>
                {user.bio && <p className="mt-2">{user.bio}</p>}
                <div className="mt-2 text-sm text-gray-500">
                  트윗 {user._count.tweets}개 · 좋아요 {user._count.likes}개
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 트윗 결과 */}
      {results.tweets.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">트윗</h2>
          <div className="space-y-4">
            {results.tweets.map((tweet) => (
              <div key={tweet.id} className="border p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Link
                    href={`/profile/${tweet.user.id}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    @{tweet.user.username}
                  </Link>
                  <span className="text-gray-500 text-sm ml-2">
                    · {formatDate(tweet.created_at)}
                  </span>
                </div>
                <Link href={`/tweet/${tweet.id}`}>
                  <p className="text-lg">{tweet.tweet}</p>
                </Link>
                <div className="mt-2 text-sm text-gray-500">
                  <span>좋아요 {tweet._count.likes}개</span> ·
                  <span className="ml-2">댓글 {tweet._count.comments}개</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4">
          검색 결과를 불러오는 중...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
