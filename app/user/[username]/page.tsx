import { getUserProfile, getUserTweets } from "@/app/actions";
import UserTweetList from "@/components/user-tweet-list";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const username = params.username;

  // Fetch user profile and their tweets
  const [userProfile, userTweets] = await Promise.all([
    getUserProfile(username),
    getUserTweets(username),
  ]);

  if (!userProfile) {
    notFound();
  }

  const joinDate = new Date(userProfile.created_at).toLocaleDateString(
    "ko-KR",
    {
      year: "numeric",
      month: "long",
    }
  );

  return (
    <div className="max-w-2xl mx-auto pt-6 px-4">
      <div className="border-b pb-6 mb-4">
        <h1 className="text-2xl font-bold mb-2">{userProfile.username}</h1>
        {userProfile.bio && (
          <p className="text-gray-700 mb-4">{userProfile.bio}</p>
        )}
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{userProfile._count.tweets} 트윗</span>
          <span>가입일: {joinDate}</span>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">
        {userProfile.username}님의 트윗
      </h2>

      {userTweets.length > 0 ? (
        <UserTweetList
          initialTweets={userTweets}
          username={username}
          tweetsPerPage={5}
          totalTweetCount={userProfile._count.tweets}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          아직 작성한 트윗이 없습니다
        </div>
      )}
    </div>
  );
}
