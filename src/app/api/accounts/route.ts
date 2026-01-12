import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { accountPayloadSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const accounts = await prisma.bankAccount.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return jsonResponse({ accounts });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const payload = await request.json();
  const parsed = accountPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  const data = parsed.data;

  const account = await prisma.bankAccount.create({
    data: {
      userId: user.id,
      name: data.name,
      type: data.type,
      bankName: data.bankName ?? null,
      accountNumber: data.accountNumber ?? null,
      icon: data.icon ?? null,
      color: data.color ?? null,
      balance: data.balance ?? 0,
      isDefault: data.isDefault ?? false,
    },
  });

  if (data.isDefault) {
    await prisma.bankAccount.updateMany({
      where: { userId: user.id, id: { not: account.id } },
      data: { isDefault: false },
    });
  }

  return jsonResponse({ account }, 201);
}
