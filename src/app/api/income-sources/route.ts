import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import dbConnect from "@/lib/db";
import { IncomeSource } from "@/models/core";
import { incomeSourceSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  await dbConnect();
  const sources = await IncomeSource.find({ userId: user.id }).sort({ createdAt: "asc" });

  return jsonResponse({
    sources: sources.map(s => ({ ...s.toObject(), id: s._id.toString() }))
  });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const payload = await request.json();
  const parsed = incomeSourceSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  await dbConnect();

  const source = await IncomeSource.create({
    userId: user.id,
    name: parsed.data.name,
    icon: parsed.data.icon ?? null,
    color: parsed.data.color ?? null,
  });

  return jsonResponse({
    source: { ...source.toObject(), id: source._id.toString() }
  }, 201);
}
