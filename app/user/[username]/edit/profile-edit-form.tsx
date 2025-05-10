"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/form-input";
import FormBtn from "@/components/form-btn";
import { UserProfile, validateProfileForm, updateProfile } from "./actions";
import { ProfileFormData, ValidationErrors } from "./schema";

interface ProfileEditFormProps {
  user: UserProfile;
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const [formData, setFormData] = useState<ProfileFormData>({
    username: user.username,
    bio: user.bio || "",
    email: user.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 필드가 변경될 때 해당 필드의 오류 메시지 초기화
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setValidationErrors({});

    // 클라이언트 측 유효성 검사
    const validationResult = validateProfileForm(formData, user);

    const result = await validationResult;
    if (!result.success) {
      setErrorMessage(result.error || "유효성 검사 실패");
      if (result.validationErrors) {
        setValidationErrors(result.validationErrors);
      }
      return;
    }

    try {
      setIsLoading(true);

      // 서버 액션 호출
      const result = await updateProfile(formData, user.id);

      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      setSuccessMessage("프로필이 성공적으로 업데이트되었습니다");

      // 성공적인 업데이트 후 페이지 새로고침 및 리디렉션
      setTimeout(() => {
        router.refresh();
        router.push(`/user/${formData.username}`);
      }, 1500);
    } catch (error: any) {
      console.error("프로필 업데이트 오류:", error);
      setErrorMessage(
        error.message || "프로필 업데이트 중 오류가 발생했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 필드에 대한 오류 메시지 가져오기
  const getFieldErrors = (fieldName: string) => {
    return validationErrors[fieldName] || [];
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
        <FormInput
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          errors={getFieldErrors("username")}
        />
        {getFieldErrors("username").map((error, index) => (
          <p key={index} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          이메일
        </label>
        <FormInput
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="이메일 변경 (선택사항)"
          errors={getFieldErrors("email")}
        />
        {getFieldErrors("email").map((error, index) => (
          <p key={index} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
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
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        {getFieldErrors("bio").map((error, index) => (
          <p key={index} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ))}
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
            <FormInput
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              errors={getFieldErrors("currentPassword")}
            />
            {getFieldErrors("currentPassword").map((error, index) => (
              <p key={index} className="mt-1 text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              새 비밀번호
            </label>
            <FormInput
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              errors={getFieldErrors("newPassword")}
            />
            {getFieldErrors("newPassword").map((error, index) => (
              <p key={index} className="mt-1 text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              새 비밀번호 확인
            </label>
            <FormInput
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              errors={getFieldErrors("confirmPassword")}
            />
            {getFieldErrors("confirmPassword").map((error, index) => (
              <p key={index} className="mt-1 text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <FormBtn text="프로필 업데이트" isLoading={isLoading} />
      </div>
    </form>
  );
}
