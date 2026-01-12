import { NextRequest } from "next/server";
import { hashPassword } from "@/lib/crypto";
import { errorResponse, jsonResponse } from "@/lib/http";
import { signJwt } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import { User } from "@/models/auth";
import { BankAccount, Category, IncomeSource } from "@/models/core";
import { SESSION_COOKIE } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
    }

    await dbConnect();

    const existingUser = await User.findOne({ email: parsed.data.email.toLowerCase() });

    if (existingUser) {
      return errorResponse("An account with this email already exists", 409);
    }

    const password = await hashPassword(parsed.data.password);

    const user = await User.create({
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name,
      password,
    });

    const userId = user._id;

    // Create default data concurrently
    await Promise.all([
      BankAccount.create([
        {
          name: "Cash",
          type: "cash",
          balance: 0,
          isDefault: true,
          icon: "wallet",
          userId,
        },
        {
          name: "Primary Bank",
          type: "bank",
          bankName: "My Bank",
          balance: 0,
          icon: "building",
          userId,
        },
      ]),
      IncomeSource.create([
        { name: "Salary", icon: "briefcase", userId },
        { name: "Freelance", icon: "laptop", userId },
      ]),
      Category.create([
        { name: "Groceries", icon: "shopping-basket", color: "#22c55e", userId },
        { name: "Rent", icon: "home", color: "#3b82f6", userId },
        { name: "Entertainment", icon: "ticket", color: "#f97316", userId },
        { name: "Utilities", icon: "lightbulb", color: "#a855f7", userId },
      ]),
    ]);

    const token = await signJwt({
      sub: userId.toString(),
      email: user.email,
      name: user.name,
    });

    const response = jsonResponse({
      user: {
        id: userId.toString(),
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
