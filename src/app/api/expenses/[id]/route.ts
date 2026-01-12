import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import dbConnect from "@/lib/db";
import { BankAccount } from "@/models/core";
import { Expense } from "@/models/transactions";
import { expenseSchema } from "@/lib/validators";
import mongoose from "mongoose";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  await dbConnect();

  const existing = await Expense.findOne({ _id: params.id, userId: user.id });

  if (!existing) {
    return errorResponse("Expense not found", 404);
  }

  const payload = await request.json();
  const parsed = expenseSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  const data = parsed.data;
  let session = null;
  let updatedExpense = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    updatedExpense = await Expense.findOneAndUpdate(
      { _id: params.id },
      {
        amount: data.amount ?? undefined,
        description: data.description ?? undefined,
        notes: data.notes ?? undefined,
        merchant: data.merchant ?? undefined,
        date: data.date ?? undefined,
        categoryId: data.categoryId ?? undefined,
        accountId: data.accountId ?? undefined,
      },
      { new: true, session }
    );

    if (data.amount !== undefined || data.accountId !== undefined) {
      const newAmount = data.amount ?? existing.amount;
      const newAccountId = data.accountId ?? existing.accountId.toString();
      const oldAccountId = existing.accountId.toString();

      const amountDiff = existing.amount - newAmount; // Income logic reversed for expense logic?
      // Wait, expense logic in Prisma code:
      // if existing.accountId !== newAccountId:
      //   oldAccount: balance: { increment: existing.amount } (Refund old)
      //   newAccount: balance: { decrement: newAmount } (Deduct new)
      // else if amountDiff !== 0:
      //   newAccount: balance: { increment: amountDiff }

      // Let's trace amountDiff logic.
      // amountDiff = existing.amount - newAmount
      // If newAmount (e.g. 50) < existing.amount (e.g. 100), diff is 50.
      // We want to increment balance by 50 (refund difference). Correct.
      // If newAmount (150) > existing (100), diff is -50.
      // We want to decrement balance by 50. Increment by -50. Correct.

      if (oldAccountId !== newAccountId) {
        // Refund old account
        await BankAccount.findByIdAndUpdate(
          oldAccountId,
          { $inc: { balance: existing.amount } },
          { session }
        );
        // Deduct from new account
        await BankAccount.findByIdAndUpdate(
          newAccountId,
          { $inc: { balance: -newAmount } },
          { session }
        );
      } else if (amountDiff !== 0) {
        // Same account, adjust by diff
        await BankAccount.findByIdAndUpdate(
          newAccountId,
          { $inc: { balance: amountDiff } },
          { session }
        );
      }
    }

    await session.commitTransaction();

    // Populate for response
    await updatedExpense.populate(['accountId', 'categoryId']);

  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("Expense update error", error);
    return errorResponse("Unable to update expense", 500);
  } finally {
    if (session) session.endSession();
  }

  return jsonResponse({
    expense: {
      ...updatedExpense.toObject(),
      id: updatedExpense._id.toString(),
      account: updatedExpense.accountId ? { ...updatedExpense.accountId.toObject(), id: updatedExpense.accountId._id.toString() } : null,
      category: updatedExpense.categoryId ? { ...updatedExpense.categoryId.toObject(), id: updatedExpense.categoryId._id.toString() } : null,
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

    const existing = await Expense.findOne({ _id: params.id, userId: user.id }).session(session);

    if (!existing) {
      await session.abortTransaction();
      return errorResponse("Expense not found", 404);
    }

    await Expense.deleteOne({ _id: params.id }, { session });

    // Refund the amount to account
    await BankAccount.findByIdAndUpdate(
      existing.accountId,
      { $inc: { balance: existing.amount } },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("Expense delete error", error);
    return errorResponse("Unable to delete expense", 500);
  } finally {
    if (session) session.endSession();
  }

  return jsonResponse({ success: true });
}
