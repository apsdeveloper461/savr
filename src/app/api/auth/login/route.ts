import { NextRequest } from "next/server";
import { comparePassword } from "@/lib/crypto";
import { errorResponse, jsonResponse } from "@/lib/http";
import { signJwt } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
      return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (!user) {
      return errorResponse("Invalid credentials", 401);
    }

    const isValid = await comparePassword(parsed.data.password, user.password);

    if (!isValid) {
      return errorResponse("Invalid credentials", 401);
    }

    const token = await signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    });

    const response = jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error", error);
    return errorResponse("Unable to login", 500);
  }
}
