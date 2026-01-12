import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import dbConnect from "@/lib/db";
import { BankAccount } from "@/models/core";
import { accountPayloadSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  await dbConnect();
  const accounts = await BankAccount.find({ userId: user.id }).sort({ createdAt: "asc" });

  return jsonResponse({
    accounts: accounts.map(a => ({ ...a.toObject(), id: a._id.toString() }))
  });
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

  await dbConnect();

  const account = await BankAccount.create({
    userId: user.id,
    name: data.name,
    type: data.type,
    bankName: data.bankName ?? null,
    accountNumber: data.accountNumber ?? null,
    icon: data.icon ?? null,
    color: data.color ?? null,
    balance: data.balance ?? 0,
    isDefault: data.isDefault ?? false,
  });

  if (data.isDefault) {
    await BankAccount.updateMany(
      { userId: user.id, _id: { $ne: account._id } },
      { isDefault: false }
    );
  }

  return jsonResponse({
    account: { ...account.toObject(), id: account._id.toString() }
  }, 201);
}
