import { NextRequest } from "next/server";
import { hashPassword } from "@/lib/crypto";
import { errorResponse, jsonResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validators";
import { signJwt } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = resetPasswordSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token: parsed.data.token },
    });

    if (!resetRecord || resetRecord.expires < new Date()) {
      return errorResponse("Invalid or expired reset token", 400);
    }

    const password = await hashPassword(parsed.data.password);

    const user = await prisma.user.update({
      where: { id: resetRecord.userId },
      data: {
        password,
        passwordResets: {
          delete: { id: resetRecord.id },
        },
      },
    });

    const token = await signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    const response = jsonResponse({ success: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Password reset error", error);
    return errorResponse("Unable to reset password", 500);
  }
}
