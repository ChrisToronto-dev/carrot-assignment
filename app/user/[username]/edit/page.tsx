import { getUserProfile } from "@/app/actions";
import ProfileEditForm from "./profile-edit-form";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { getSessionWithCookies } from "@/lib/session";

interface ProfileEditPageProps {
  params: {
    username: string; // Changed from id to username
  };
}

export default async function ProfileEditPage({
  params,
}: ProfileEditPageProps) {
  const username = params.username;

  // Fetch user profile data
  const userProfile = await getUserProfile(username);

  if (!userProfile) {
    notFound();
  }

  // Verify if the current user is authorized to edit this profile
  const cookiesInstance = cookies();
  const session = await getSessionWithCookies(cookiesInstance);

  if (!session || session.id !== userProfile.id) {
    redirect(`/user/${username}`); // Redirect to profile page if not authorized
  }

  return (
    <div className="max-w-2xl mx-auto pt-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">프로필 수정</h1>
        <Link
          href={`/user/${username}`}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          취소
        </Link>
      </div>

      <ProfileEditForm user={userProfile} />
    </div>
  );
}
