"use client";
import { InitialTweets } from "@/app/page";
import ListTweet from "./list-tweet";
import { useState, useEffect } from "react";
import { getMoreTweets } from "@/app/actions";

interface TweetListProps {
  initialTweets: InitialTweets;
  tweetsPerPage?: number;
}

export default function TweetList({
  initialTweets,
  tweetsPerPage = 1,
}: TweetListProps) {
  const [allTweets, setAllTweets] = useState<InitialTweets>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [fetchedPages, setFetchedPages] = useState<number[]>([0]);

  useEffect(() => {
    if (initialTweets.length > 0) {
      setAllTweets(initialTweets);
      const initialTotalPages = Math.max(
        Math.ceil(initialTweets.length / tweetsPerPage),
        2
      );
      setTotalPages(initialTotalPages);
    }
  }, [initialTweets, tweetsPerPage]);

  const currentTweet =
    allTweets.length > 0
      ? [allTweets[(currentPage - 1) % allTweets.length]]
      : [];

  const fetchPageData = async (pageNumber: number) => {
    if (fetchedPages.includes(pageNumber)) {
      return true;
    }

    try {
      setIsLoading(true);
      const newTweets = await getMoreTweets(pageNumber);

      if (newTweets && newTweets.length > 0) {
        const existingIds = new Set(allTweets.map((tweet) => tweet.id));
        const uniqueNewTweets = newTweets.filter(
          (tweet) => !existingIds.has(tweet.id)
        );

        if (uniqueNewTweets.length > 0) {
          setAllTweets((prev) => [...prev, ...uniqueNewTweets]);
          setFetchedPages((prev) => [...prev, pageNumber]);

          setTotalPages((prev) => prev + uniqueNewTweets.length);
          return true;
        }
      }

      if (pageNumber > 0) {
        setHasMoreData(false);
      }
      return false;
    } catch (error) {
      console.error(`Error fetching page ${pageNumber}:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (pageNumber: number) => {
    if (pageNumber === currentPage || pageNumber < 1) {
      return;
    }

    setCurrentPage(pageNumber);

    if (pageNumber > allTweets.length && hasMoreData) {
      await fetchPageData(pageNumber - 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const goToNextPage = async () => {
    if (currentPage >= allTweets.length && hasMoreData) {
      const hasNewData = await fetchPageData(currentPage);
      if (hasNewData) {
        handlePageChange(currentPage + 1);
      }
    } else if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const isNextButtonDisabled = () => {
    if (isLoading) return true;

    if (hasMoreData) return false;
    return currentPage >= totalPages;
  };

  return (
    <div className="p-5 flex flex-col gap-5">
      {currentTweet.length > 0 ? (
        currentTweet.map((tweet) => <ListTweet key={tweet.id} {...tweet} />)
      ) : (
        <div className="text-center py-4">
          <span className="text-gray-500">표시할 트윗이 없습니다</span>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-2">
          <span className="text-gray-500">로딩 중...</span>
        </div>
      )}

      <div className="flex justify-center items-center mt-4">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 1 || isLoading}
          className={`px-3 py-1 rounded-md mr-2 ${
            currentPage === 1 || isLoading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-orange-500 text-white hover:opacity-90 active:scale-95"
          }`}
        >
          이전
        </button>

        <div className="flex items-center mx-2">
          <span className="text-sm font-medium">
            {currentPage} / {hasMoreData ? `${totalPages}+` : totalPages}
          </span>
        </div>

        <button
          onClick={goToNextPage}
          disabled={isNextButtonDisabled()}
          className={`px-3 py-1 rounded-md ml-2 ${
            isNextButtonDisabled()
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-orange-500 text-white hover:opacity-90 active:scale-95"
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}
