import { NextRequest } from "next/server";
import { hashPassword } from "@/lib/crypto";
import { errorResponse, jsonResponse } from "@/lib/http";
import dbConnect from "@/lib/db";
import { User, PasswordReset } from "@/models/auth";
import { SESSION_COOKIE } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validators";
import { signJwt } from "@/lib/jwt";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = resetPasswordSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
    }

    await dbConnect();

    const resetRecord = await PasswordReset.findOne({ token: parsed.data.token });

    if (!resetRecord || resetRecord.expires < new Date()) {
      return errorResponse("Invalid or expired reset token", 400);
    }

    const password = await hashPassword(parsed.data.password);

    let session = null;
    let user;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

      // Mongoose findOneAndUpdate returns the document BEFORE update by default, { new: true } returns updated.
      // But here we want the doc to create jwt.
      user = await User.findByIdAndUpdate(
        resetRecord.userId,
        { password },
        { session, new: true }
      );

      await PasswordReset.deleteOne({ _id: resetRecord._id }, { session });

      await session.commitTransaction();
    } catch (e) {
      if (session) await session.abortTransaction();
      throw e;
    } finally {
      if (session) session.endSession();
    }

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const token = await signJwt({
      sub: user._id.toString(),
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
