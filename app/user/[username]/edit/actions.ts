"use server";

import { z } from "zod";
import {
  profileSchema,
  passwordChangeSchema,
  type ProfileFormData,
  type ValidationErrors,
} from "./schema";
import { UserProfile } from "@/app/actions";

// 사용자 프로필 정보 가져오기
export async function getUserProfile(
  username: string
): Promise<UserProfile | null> {
  try {
    // 실제 구현에 맞게 API 호출이나 데이터베이스 쿼리를 수행
    const response = await fetch(
      `${process.env.API_URL}/api/user/${username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("사용자 프로필 조회 오류:", error);
    return null;
  }
}

export async function updateProfile(formData: ProfileFormData, userId: number) {
  try {
    const response = await fetch("/api/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: userId,
        username: formData.username,
        bio: formData.bio,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const textError = await response.text();
        console.error("API 응답 오류 (텍스트):", textError);
        return { error: "서버 응답이 유효한 JSON이 아닙니다" };
      }

      const errorData = await response.json();
      return { error: errorData.message || "프로필 업데이트에 실패했습니다" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("프로필 업데이트 오류:", error);
    return {
      error: error.message || "프로필 업데이트 중 오류가 발생했습니다",
    };
  }
}

export async function validateProfileForm(
  formData: ProfileFormData,
  user: UserProfile
) {
  try {
    // 기본 프로필 데이터 유효성 검사
    profileSchema.parse(formData);

    // 비밀번호 변경 유효성 검사 (비밀번호 변경 시도 시에만)
    if (
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmPassword
    ) {
      passwordChangeSchema.parse({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
    }

    // 변경된 필드가 있는지 확인
    const hasProfileChanges =
      formData.username !== user.username ||
      formData.bio !== user.bio ||
      formData.email !== user.email;
    const hasPasswordChanges = formData.currentPassword && formData.newPassword;

    if (!hasProfileChanges && !hasPasswordChanges) {
      return {
        success: false,
        error: "변경된 내용이 없습니다",
      };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationErrors = {};
      error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });

      return {
        success: false,
        error: "입력 정보를 확인해주세요",
        validationErrors: errors,
      };
    } else {
      return {
        success: false,
        error: "양식 검증 중 오류가 발생했습니다",
      };
    }
  }
}
