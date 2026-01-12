import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import dbConnect from "@/lib/db";
import { Category } from "@/models/core";
import { categorySchema } from "@/lib/validators";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const payload = await request.json();
  const parsed = categorySchema.partial().safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  await dbConnect();
  const category = await Category.findOneAndUpdate(
    { _id: params.id, userId: user.id },
    {
      name: parsed.data.name ?? undefined,
      icon: parsed.data.icon ?? undefined,
      color: parsed.data.color ?? undefined,
      budget: parsed.data.budget ?? undefined,
    },
    { new: true }
  );

  if (!category) return errorResponse("Category not found", 404);

  return jsonResponse({ category: { ...category.toObject(), id: category._id.toString() } });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  await dbConnect();
  await Category.deleteOne({ _id: params.id, userId: user.id });
  return jsonResponse({ success: true });
}
