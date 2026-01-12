import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { errorResponse, jsonResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requestResetSchema } from "@/lib/validators";

const RESET_TOKEN_EXPIRY_MINUTES = 60;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = requestResetSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (!user) {
      return jsonResponse({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expires,
      },
    });

    const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

    console.info(`Password reset requested for ${user.email}: ${resetUrl}`);

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Password reset request error", error);
    return errorResponse("Unable to request password reset", 500);
  }
}
