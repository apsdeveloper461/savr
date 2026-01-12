import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { AppJwtPayload, verifyJwt } from "./jwt";
import dbConnect from "@/lib/db";
import { User } from "@/models/auth";
import { BankAccount, Category, IncomeSource } from "@/models/core";
import { SavingGoal } from "@/models/transactions";

export const SESSION_COOKIE = "savr_session";

const readSessionToken = async () => {
  const cookieStore = await Promise.resolve(cookies());
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
};

export const getSessionToken = async () => {
  try {
    return await readSessionToken();
  } catch (_error) {
    return null;
  }
};

export const getTokenFromRequest = (request: NextRequest) => {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return token ?? null;
};

export const getCurrentUser = async () => {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyJwt(token);
    await dbConnect();

    // Fetch user and related data manually since Mongoose doesn't have "include" like Prisma
    // We can use .lean() for better performance if we don't need hydration, but let's stick to simple first
    const user = await User.findById(payload.sub).lean();

    if (!user) return null;

    // Fetch related data
    const [accounts, categories, incomeSources, savingGoals] = await Promise.all([
      BankAccount.find({ userId: user._id }).lean(),
      Category.find({ userId: user._id }).lean(),
      IncomeSource.find({ userId: user._id }).lean(),
      SavingGoal.find({ userId: user._id }).lean(),
    ]);

    return {
      ...user,
      id: user._id.toString(), // Normalize ID
      accounts: accounts.map(a => ({ ...a, id: a._id.toString() })),
      categories: categories.map(c => ({ ...c, id: c._id.toString() })),
      incomeSources: incomeSources.map(i => ({ ...i, id: i._id.toString() })),
      savingGoals: savingGoals.map(s => ({ ...s, id: s._id.toString() })),
    };
  } catch (_error) {
    return null;
  }
};

export const requireUser = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
};

export const decodeSession = async (): Promise<AppJwtPayload | null> => {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }
  try {
    return await verifyJwt(token);
  } catch (_error) {
    return null;
  }
};

export const getUserFromRequest = async (request: NextRequest) => {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyJwt(token);
    await dbConnect();
    const user = await User.findById(payload.sub).lean();
    if (user) {
      return { ...user, id: user._id.toString() };
    }
    return null;
  } catch (_error) {
    return null;
  }
};
