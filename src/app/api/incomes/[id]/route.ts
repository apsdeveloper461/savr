import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import dbConnect from "@/lib/db";
import { BankAccount } from "@/models/core";
import { Income, Expense } from "@/models/transactions";
import { incomeSchema } from "@/lib/validators";
import mongoose from "mongoose";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  await dbConnect();

  const existing = await Income.findOne({ _id: params.id, userId: user.id });

  if (!existing) {
    return errorResponse("Income not found", 404);
  }

  const payload = await request.json();
  const parsed = incomeSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  const data = parsed.data;
  let session = null;
  let updatedIncome = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    updatedIncome = await Income.findOneAndUpdate(
      { _id: params.id },
      {
        amount: data.amount ?? undefined,
        description: data.description ?? undefined,
        notes: data.notes ?? undefined,
        date: data.date ?? undefined,
        sourceId: data.sourceId ?? undefined,
        accountId: data.accountId ?? undefined,
      },
      { new: true, session }
    );

    if (data.amount !== undefined || data.accountId !== undefined) {
      const newAmount = data.amount ?? existing.amount;
      const newAccountId = data.accountId ?? existing.accountId.toString();
      const oldAccountId = existing.accountId.toString();

      const amountDiff = newAmount - existing.amount;

      if (oldAccountId !== newAccountId) {
        // Reverse old transaction
        await BankAccount.findByIdAndUpdate(
          oldAccountId,
          { $inc: { balance: -existing.amount } },
          { session }
        );
        // Apply new transaction
        await BankAccount.findByIdAndUpdate(
          newAccountId,
          { $inc: { balance: newAmount } },
          { session }
        );
      } else if (amountDiff !== 0) {
        // Same account, just diff
        await BankAccount.findByIdAndUpdate(
          newAccountId,
          { $inc: { balance: amountDiff } },
          { session }
        );
      }
    }

    await session.commitTransaction();

    // Populate for response
    await updatedIncome.populate(['accountId', 'sourceId']);

  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("Income update error", error);
    return errorResponse("Unable to update income", 500);
  } finally {
    if (session) session.endSession();
  }

  return jsonResponse({
    income: {
      ...updatedIncome.toObject(),
      id: updatedIncome._id.toString(),
      account: updatedIncome.accountId ? { ...updatedIncome.accountId.toObject(), id: updatedIncome.accountId._id.toString() } : null,
      source: updatedIncome.sourceId ? { ...updatedIncome.sourceId.toObject(), id: updatedIncome.sourceId._id.toString() } : null,
    }
  });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  await dbConnect();

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const existing = await Income.findOne({ _id: params.id, userId: user.id }).session(session);

    if (!existing) {
      await session.abortTransaction();
      return errorResponse("Income not found", 404);
    }

    await Income.deleteOne({ _id: params.id }, { session });

    await BankAccount.findByIdAndUpdate(
      existing.accountId,
      { $inc: { balance: -existing.amount } },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("Income delete error", error);
    return errorResponse("Unable to delete income", 500);
  } finally {
    if (session) session.endSession();
  }

  return jsonResponse({ success: true });
}
