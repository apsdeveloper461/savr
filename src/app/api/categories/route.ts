import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import dbConnect from "@/lib/db";
import { Category } from "@/models/core";
import { categorySchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  await dbConnect();
  const categories = await Category.find({ userId: user.id }).sort({ name: "asc" });

  return jsonResponse({
    categories: categories.map(c => ({ ...c.toObject(), id: c._id.toString() }))
  });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const payload = await request.json();
  const parsed = categorySchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  await dbConnect();

  const category = await Category.create({
    userId: user.id,
    name: parsed.data.name,
    icon: parsed.data.icon ?? null,
    color: parsed.data.color ?? null,
    budget: parsed.data.budget ?? null,
  });

  return jsonResponse({
    category: { ...category.toObject(), id: category._id.toString() }
  }, 201);
}
