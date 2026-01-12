import { NextRequest } from "next/server";
import { hashPassword } from "@/lib/crypto";
import { errorResponse, jsonResponse } from "@/lib/http";
import { signJwt } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (existingUser) {
      return errorResponse("An account with this email already exists", 409);
    }

    const password = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        name: parsed.data.name,
        password,
        accounts: {
          create: [
            {
              name: "Cash",
              type: "cash",
              balance: 0,
              isDefault: true,
              icon: "wallet",
            },
            {
              name: "Primary Bank",
              type: "bank",
              bankName: "My Bank",
              balance: 0,
              icon: "building",
            },
          ],
        },
        incomeSources: {
          create: [
            { name: "Salary", icon: "briefcase" },
            { name: "Freelance", icon: "laptop" },
          ],
        },
        categories: {
          create: [
            { name: "Groceries", icon: "shopping-basket", color: "#22c55e" },
            { name: "Rent", icon: "home", color: "#3b82f6" },
            { name: "Entertainment", icon: "ticket", color: "#f97316" },
            { name: "Utilities", icon: "lightbulb", color: "#a855f7" },
          ],
        },
      },
    });

    const token = await signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    const response = jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }, 201);

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Registration error", error);
    return errorResponse("Unable to register", 500);
  }
}
