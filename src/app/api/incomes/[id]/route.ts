import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { incomeSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const existing = await prisma.income.findUnique({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return errorResponse("Income not found", 404);
  }

  const payload = await request.json();
  const parsed = incomeSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  const data = parsed.data;
  const updated = await prisma.income.update({
    where: { id: params.id },
    data: {
      amount: data.amount ?? undefined,
      description: data.description ?? undefined,
      notes: data.notes ?? undefined,
      date: data.date ?? undefined,
      sourceId: data.sourceId ?? undefined,
      accountId: data.accountId ?? undefined,
    },
    include: {
      account: true,
      source: true,
    },
  });

  if (data.amount !== undefined || data.accountId !== undefined) {
    const newAmount = data.amount ?? existing.amount;
    const newAccountId = data.accountId ?? existing.accountId;

    const amountDiff = newAmount - existing.amount;

    if (existing.accountId !== newAccountId) {
      await prisma.bankAccount.update({
        where: { id: existing.accountId },
        data: { balance: { decrement: existing.amount } },
      });
      await prisma.bankAccount.update({
        where: { id: newAccountId },
        data: { balance: { increment: newAmount } },
      });
    } else if (amountDiff !== 0) {
      await prisma.bankAccount.update({
        where: { id: newAccountId },
        data: { balance: { increment: amountDiff } },
      });
    }
  }

  return jsonResponse({ income: updated });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const existing = await prisma.income.findUnique({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return errorResponse("Income not found", 404);
  }

  await prisma.income.delete({ where: { id: params.id } });
  await prisma.bankAccount.update({
    where: { id: existing.accountId },
    data: { balance: { decrement: existing.amount } },
  });

  return jsonResponse({ success: true });
}
