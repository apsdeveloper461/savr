import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import dbConnect from "@/lib/db";
import { IncomeSource } from "@/models/core";
import { incomeSourceSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const payload = await request.json();
  const parsed = incomeSourceSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  await dbConnect();
  const source = await IncomeSource.findOneAndUpdate(
    { _id: params.id, userId: user.id },
    {
      name: parsed.data.name ?? undefined,
      icon: parsed.data.icon ?? undefined,
      color: parsed.data.color ?? undefined,
    },
    { new: true }
  );

  if (!source) return errorResponse("Source not found", 404);

  return jsonResponse({ source: { ...source.toObject(), id: source._id.toString() } });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  await dbConnect();
  await IncomeSource.deleteOne({ _id: params.id, userId: user.id });
  return jsonResponse({ success: true });
}
