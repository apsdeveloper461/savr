import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { accountPayloadSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const payload = await request.json();
  const parsed = accountPayloadSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  const data = parsed.data;
  const account = await prisma.bankAccount.update({
    where: { id: params.id, userId: user.id },
    data: {
      name: data.name ?? undefined,
      type: data.type ?? undefined,
      bankName: data.bankName ?? undefined,
      accountNumber: data.accountNumber ?? undefined,
      icon: data.icon ?? undefined,
      color: data.color ?? undefined,
      balance: data.balance ?? undefined,
      isDefault: data.isDefault ?? undefined,
    },
  });

  if (data.isDefault) {
    await prisma.bankAccount.updateMany({
      where: { userId: user.id, id: { not: account.id } },
      data: { isDefault: false },
    });
  }

  return jsonResponse({ account });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  await prisma.bankAccount.delete({
    where: { id: params.id, userId: user.id },
  });

  return jsonResponse({ success: true });
}
