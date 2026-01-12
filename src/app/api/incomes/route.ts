import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { incomeSchema } from "@/lib/validators";

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

  const incomes = await prisma.income.findMany({
    where,
    include: {
      account: true,
      source: true,
    },
    orderBy: { date: "desc" },
  });

  return jsonResponse({ incomes });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const payload = await request.json();
  const parsed = incomeSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  const data = parsed.data;
  const [account, source] = await Promise.all([
    prisma.bankAccount.findFirst({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    }),
    prisma.incomeSource.findFirst({
      where: {
        id: data.sourceId,
        userId: user.id,
      },
    }),
  ]);

  if (!account) {
    return errorResponse("Account not found", 400);
  }

  if (!source) {
    return errorResponse("Income source not found", 400);
  }

  const [income] = await prisma.$transaction([
    prisma.income.create({
      data: {
        userId: user.id,
        amount: data.amount,
        description: data.description ?? null,
        notes: data.notes ?? null,
        date: data.date,
        sourceId: data.sourceId,
        accountId: data.accountId,
      },
      include: {
        account: true,
        source: true,
      },
    }),
    prisma.bankAccount.update({
      where: { id: account.id },
      data: { balance: { increment: data.amount } },
    }),
  ]);

  return jsonResponse({ income }, 201);
}
