import { z } from "zod";

// Zod 스키마 정의
export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "사용자 이름은 최소 3자 이상이어야 합니다")
    .max(20, "사용자 이름은 최대 20자까지 가능합니다")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "사용자 이름은 영문, 숫자, 밑줄만 사용 가능합니다"
    ),
  bio: z.string().max(500, "소개는 최대 500자까지 가능합니다").optional(),
  email: z
    .string()
    .email("유효한 이메일 주소를 입력해주세요")
    .optional()
    .or(z.literal("")),
  currentPassword: z.string().optional().or(z.literal("")),
  newPassword: z.string().optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
});

// 비밀번호 변경 검증을 위한 추가 스키마
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
    newPassword: z
      .string()
      .min(8, "새 비밀번호는 최소 8자 이상이어야 합니다")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다"
      ),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "새 비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export type ProfileFormData = z.infer<typeof profileSchema>;
export type ValidationErrors = {
  [key: string]: string[];
};
