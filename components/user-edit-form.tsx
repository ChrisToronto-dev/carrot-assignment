"use client";

import { UserProfile } from "@/app/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileEditFormProps {
  user: UserProfile;
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    username: user.username,
    bio: user.bio || "",
    email: "", // We'll need to update the user interface to include email
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Password validation
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setErrorMessage("새 비밀번호가 일치하지 않습니다");
      return;
    }

    // Check if at least one field has changed
    const hasProfileChanges =
      formData.username !== user.username || formData.bio !== user.bio;
    const hasPasswordChanges = formData.currentPassword && formData.newPassword;

    if (!hasProfileChanges && !hasPasswordChanges) {
      setErrorMessage("변경된 내용이 없습니다");
      return;
    }

    try {
      setIsLoading(true);

      // Call server action to update profile
      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          username: formData.username,
          bio: formData.bio,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "프로필 업데이트에 실패했습니다");
      }

      setSuccessMessage("프로필이 성공적으로 업데이트되었습니다");

      // Refresh the page after successful update
      setTimeout(() => {
        router.refresh();
        router.push(`/profile/${user.id}`);
      }, 1500);
    } catch (error: any) {
      setErrorMessage(
        error.message || "프로필 업데이트 중 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-100 border border-green-300 rounded-md text-green-700">
          {successMessage}
        </div>
      )}

      <div className="space-y-1">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700"
        >
          사용자 이름
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          이메일
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="이메일 변경 (선택사항)"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700"
        >
          소개
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div className="border-t pt-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">비밀번호 변경</h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700"
            >
              현재 비밀번호
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              새 비밀번호
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              새 비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full p-3 rounded-md bg-orange-500 text-white font-medium
            ${
              isLoading
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-orange-600 active:bg-orange-700"
            }
          `}
        >
          {isLoading ? "처리 중..." : "프로필 업데이트"}
        </button>
      </div>
    </form>
  );
}
