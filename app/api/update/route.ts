import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionWithCookies } from "@/lib/session";
import bcrypt from "bcrypt";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const cookiesInstance = cookies();
    const session = await getSessionWithCookies(cookiesInstance);

    console.log(session);
    if (!session) {
      return NextResponse.json(
        { message: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, username, bio, email, currentPassword, newPassword } = body;
    console.log(session);
    // Check if the logged-in user is updating their own profile

    // Find the user
    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // Check if username already exists (if changed)
    if (username !== user.username) {
      const existingUser = await db.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "이미 사용 중인 사용자 이름입니다" },
          { status: 400 }
        );
      }
    }

    // Check if email already exists (if provided and changed)
    if (email && email !== user.email) {
      const existingEmail = await db.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return NextResponse.json(
          { message: "이미 사용 중인 이메일입니다" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      username,
      bio,
    };

    // Add email to update if provided
    if (email) {
      updateData.email = email;
    }

    // Handle password change if requested
    if (currentPassword && newPassword) {
      // Verify current password
      if (!user.password) {
        return NextResponse.json(
          { message: "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다" },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "현재 비밀번호가 올바르지 않습니다" },
          { status: 400 }
        );
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: "프로필이 성공적으로 업데이트되었습니다",
        username: updatedUser.username, // Return the updated username for redirection
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "프로필 업데이트 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
