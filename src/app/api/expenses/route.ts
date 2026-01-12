import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import dbConnect from "@/lib/db";
import { BankAccount, Category } from "@/models/core";
import { Expense } from "@/models/transactions";
import { expenseSchema } from "@/lib/validators";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  const query: any = { userId: user.id };

  if (startParam || endParam) {
    query.date = {};
    if (startParam) query.date.$gte = new Date(startParam);
    if (endParam) query.date.$lte = new Date(endParam);
  }

  await dbConnect();

  const expenses = await Expense.find(query)
    .populate('accountId')
    .populate('categoryId')
    .sort({ date: "desc" });

  return jsonResponse({
    expenses: expenses.map(e => ({
      ...e.toObject(),
      id: e._id.toString(),
      account: e.accountId ? { ...e.accountId.toObject(), id: e.accountId._id.toString() } : null,
      category: e.categoryId ? { ...e.categoryId.toObject(), id: e.categoryId._id.toString() } : null,
      accountId: e.accountId?._id.toString(),
      categoryId: e.categoryId?._id.toString()
    }))
  });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const payload = await request.json();
  const parsed = expenseSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  const data = parsed.data;
  await dbConnect();

  const [account, category] = await Promise.all([
    BankAccount.findOne({ _id: data.accountId, userId: user.id }),
    Category.findOne({ _id: data.categoryId, userId: user.id }),
  ]);

  if (!account) {
    return errorResponse("Account not found", 400);
  }

  if (!category) {
    return errorResponse("Category not found", 400);
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const [expense] = await Expense.create([{
      userId: user.id,
      amount: data.amount,
      description: data.description ?? null,
      notes: data.notes ?? null,
      merchant: data.merchant ?? null,
      date: data.date,
      categoryId: data.categoryId,
      accountId: data.accountId,
    }], { session });

    await BankAccount.findByIdAndUpdate(
      account._id,
      { $inc: { balance: -data.amount } }, // Decrement for expense
      { session }
    );

    await session.commitTransaction();

    await expense.populate(['accountId', 'categoryId']);

    return jsonResponse({
      expense: {
        ...expense.toObject(),
        id: expense._id.toString(),
        account: expense.accountId ? { ...expense.accountId.toObject(), id: expense.accountId._id.toString() } : null,
        category: expense.categoryId ? { ...expense.categoryId.toObject(), id: expense.categoryId._id.toString() } : null,
      }
    }, 201);
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("Expense creation error", error);
    return errorResponse("Unable to create expense", 500);
  } finally {
    if (session) session.endSession();
  }
}
