import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import dbConnect from "@/lib/db";
import { BankAccount } from "@/models/core";
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
  await dbConnect();

  const account = await BankAccount.findOneAndUpdate(
    { _id: params.id, userId: user.id },
    {
      $set: {
        name: data.name ?? undefined,
        type: data.type ?? undefined,
        bankName: data.bankName ?? undefined,
        accountNumber: data.accountNumber ?? undefined,
        icon: data.icon ?? undefined,
        color: data.color ?? undefined,
        balance: data.balance ?? undefined,
        isDefault: data.isDefault ?? undefined,
      }
    },
    { new: true, runValidators: true }
  );

  if (!account) {
    return errorResponse("Account not found", 404);
  }

  if (data.isDefault) {
    await BankAccount.updateMany(
      { userId: user.id, _id: { $ne: account._id } },
      { isDefault: false }
    );
  }

  return jsonResponse({ account: { ...account.toObject(), id: account._id.toString() } });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  await dbConnect();
  await BankAccount.deleteOne({ _id: params.id, userId: user.id });

  return jsonResponse({ success: true });
}
