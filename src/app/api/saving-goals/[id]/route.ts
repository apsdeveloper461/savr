import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import dbConnect from "@/lib/db";
import { SavingGoal } from "@/models/transactions";
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

  await dbConnect();
  const goal = await SavingGoal.findOneAndUpdate(
    { _id: params.id, userId: user.id },
    {
      name: parsed.data.name ?? undefined,
      targetAmount: parsed.data.targetAmount ?? undefined,
      currentAmount: parsed.data.currentAmount ?? undefined,
      deadline: parsed.data.deadline ?? undefined,
      type: parsed.data.type ?? undefined,
      icon: parsed.data.icon ?? undefined,
      color: parsed.data.color ?? undefined,
      isCompleted: parsed.data.isCompleted ?? undefined,
    },
    { new: true }
  );

  if (!goal) return errorResponse("Goal not found", 404);

  return jsonResponse({ goal: { ...goal.toObject(), id: goal._id.toString() } });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  await dbConnect();
  await SavingGoal.deleteOne({ _id: params.id, userId: user.id });
  return jsonResponse({ success: true });
}
