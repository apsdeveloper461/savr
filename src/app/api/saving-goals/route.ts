import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { savingGoalSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const goals = await prisma.savingGoal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return jsonResponse({ goals });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const payload = await request.json();
  const parsed = savingGoalSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  const goal = await prisma.savingGoal.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      currentAmount: parsed.data.currentAmount ?? 0,
      deadline: parsed.data.deadline ?? null,
      type: parsed.data.type,
      icon: parsed.data.icon ?? null,
      color: parsed.data.color ?? null,
      isCompleted: parsed.data.isCompleted ?? false,
    },
  });

  return jsonResponse({ goal }, 201);
}
