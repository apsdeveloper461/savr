import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  const where = {
    userId: user.id,
    date: {
      gte: startParam ? new Date(startParam) : undefined,
      lte: endParam ? new Date(endParam) : undefined,
    },
  } as const;

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      account: true,
      category: true,
    },
    orderBy: { date: "desc" },
  });

  return jsonResponse({ expenses });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const payload = await request.json();
  const parsed = expenseSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  const data = parsed.data;
  const [account, category] = await Promise.all([
    prisma.bankAccount.findFirst({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    }),
    prisma.category.findFirst({
      where: {
        id: data.categoryId,
        userId: user.id,
      },
    }),
  ]);

  if (!account) {
    return errorResponse("Account not found", 400);
  }

  if (!category) {
    return errorResponse("Category not found", 400);
  }

  const [expense] = await prisma.$transaction([
    prisma.expense.create({
      data: {
        userId: user.id,
        amount: data.amount,
        description: data.description ?? null,
        notes: data.notes ?? null,
        merchant: data.merchant ?? null,
        date: data.date,
        categoryId: data.categoryId,
        accountId: data.accountId,
      },
      include: {
        account: true,
        category: true,
      },
    }),
    prisma.bankAccount.update({
      where: { id: account.id },
      data: { balance: { decrement: data.amount } },
    }),
  ]);

  return jsonResponse({ expense }, 201);
}
