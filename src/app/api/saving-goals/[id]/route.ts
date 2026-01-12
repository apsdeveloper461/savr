import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { savingGoalSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const payload = await request.json();
  const parsed = savingGoalSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  const goal = await prisma.savingGoal.update({
    where: { id: params.id, userId: user.id },
    data: {
      name: parsed.data.name ?? undefined,
      targetAmount: parsed.data.targetAmount ?? undefined,
      currentAmount: parsed.data.currentAmount ?? undefined,
      deadline: parsed.data.deadline ?? undefined,
      type: parsed.data.type ?? undefined,
      icon: parsed.data.icon ?? undefined,
      color: parsed.data.color ?? undefined,
      isCompleted: parsed.data.isCompleted ?? undefined,
    },
  });

  return jsonResponse({ goal });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  await prisma.savingGoal.delete({ where: { id: params.id, userId: user.id } });
  return jsonResponse({ success: true });
}
