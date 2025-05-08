"use client";

import { InitialTweets, getMoreUserTweets } from "@/app/actions";
import ListTweet from "./list-tweet";
import { useState, useEffect } from "react";

interface UserTweetListProps {
  initialTweets: InitialTweets;
  username: string; // Changed from userId to username
  tweetsPerPage?: number;
  totalTweetCount: number;
}

export default function UserTweetList({
  initialTweets,
  username,
  tweetsPerPage = 5,
  totalTweetCount,
}: UserTweetListProps) {
  const [allTweets, setAllTweets] = useState<InitialTweets>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [fetchedPages, setFetchedPages] = useState<number[]>([0]);

  useEffect(() => {
    if (initialTweets.length > 0) {
      setAllTweets(initialTweets);
      // Calculate total pages based on the total tweet count passed from the profile
      const calculatedTotalPages = Math.ceil(totalTweetCount / tweetsPerPage);
      setTotalPages(calculatedTotalPages);
    }
  }, [initialTweets, tweetsPerPage, totalTweetCount]);

  const currentTweets = allTweets.slice(
    (currentPage - 1) * tweetsPerPage,
    currentPage * tweetsPerPage
  );

  const fetchPageData = async (pageNumber: number) => {
    if (fetchedPages.includes(pageNumber)) {
      return true;
    }

    try {
      setIsLoading(true);
      const newTweets = await getMoreUserTweets(username, pageNumber);

      if (newTweets && newTweets.length > 0) {
        const existingIds = new Set(allTweets.map((tweet) => tweet.id));
        const uniqueNewTweets = newTweets.filter(
          (tweet) => !existingIds.has(tweet.id)
        );

        if (uniqueNewTweets.length > 0) {
          setAllTweets((prev) => {
            const updatedTweets = [...prev, ...uniqueNewTweets];
            setTotalPages(Math.ceil(updatedTweets.length / tweetsPerPage));
            return updatedTweets;
          });

          setFetchedPages((prev) => [...prev, pageNumber]);
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

    const requiredTweets = pageNumber * tweetsPerPage;
    if (requiredTweets > allTweets.length && hasMoreData) {
      await fetchPageData(Math.floor(allTweets.length / tweetsPerPage));
    }

    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    const checkAndLoadMoreTweets = async () => {
      const requiredTweets = currentPage * tweetsPerPage;
      if (requiredTweets > allTweets.length && hasMoreData && !isLoading) {
        await fetchPageData(Math.floor(allTweets.length / tweetsPerPage));
      }
    };

    checkAndLoadMoreTweets();
  }, [currentPage, allTweets.length, tweetsPerPage, hasMoreData, isLoading]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = async () => {
    const nextPage = currentPage + 1;
    const requiredTweetsForNextPage = nextPage * tweetsPerPage;

    if (
      requiredTweetsForNextPage > allTweets.length &&
      hasMoreData &&
      !isLoading
    ) {
      const newTweets = await getMoreUserTweets(
        username,
        Math.floor(allTweets.length / tweetsPerPage)
      );

      if (newTweets && newTweets.length > 0) {
        const existingIds = new Set(allTweets.map((tweet) => tweet.id));
        const uniqueNewTweets = newTweets.filter(
          (tweet) => !existingIds.has(tweet.id)
        );

        if (uniqueNewTweets.length > 0) {
          setAllTweets((prev) => {
            const updatedTweets = [...prev, ...uniqueNewTweets];
            setTotalPages(Math.ceil(updatedTweets.length / tweetsPerPage));
            return updatedTweets;
          });
          setFetchedPages((prev) => [
            ...prev,
            Math.floor(allTweets.length / tweetsPerPage),
          ]);
          setCurrentPage(nextPage);
          if (
            allTweets.length + uniqueNewTweets.length <
            requiredTweetsForNextPage
          ) {
            setHasMoreData(false);
          }
        } else {
          setHasMoreData(false);
          if (currentPage < totalPages) {
            setCurrentPage(nextPage);
          }
        }
      } else {
        setHasMoreData(false);
        if (currentPage < totalPages) {
          setCurrentPage(nextPage);
        }
      }
    } else if (currentPage < totalPages) {
      setCurrentPage(nextPage);
    }
  };

  const isNextButtonDisabled = () => {
    if (isLoading) return true;
    if (hasMoreData) return false;
    return currentPage >= totalPages;
  };

  return (
    <div className="flex flex-col gap-5">
      {currentTweets.length > 0 ? (
        currentTweets.map((tweet) => <ListTweet key={tweet.id} {...tweet} />)
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
            {currentPage} / {totalPages}
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
