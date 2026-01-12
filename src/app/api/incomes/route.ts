import { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { errorResponse, jsonResponse } from "@/lib/http";
import dbConnect from "@/lib/db";
import { BankAccount, IncomeSource } from "@/models/core";
import { Income, Expense } from "@/models/transactions";
import { incomeSchema } from "@/lib/validators";
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

  // Populate reference fields to match Prisma's "include"
  const incomes = await Income.find(query)
    .populate('accountId')
    .populate('sourceId')
    .sort({ date: "desc" });

  return jsonResponse({
    incomes: incomes.map(i => ({
      ...i.toObject(),
      id: i._id.toString(),
      account: i.accountId ? { ...i.accountId.toObject(), id: i.accountId._id.toString() } : null,
      source: i.sourceId ? { ...i.sourceId.toObject(), id: i.sourceId._id.toString() } : null,
      accountId: i.accountId?._id.toString(), // Ensure IDs are strings
      sourceId: i.sourceId?._id.toString()
    }))
  });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return errorResponse("Unauthenticated", 401);
  }

  const payload = await request.json();
  const parsed = incomeSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(parsed.error.flatten().formErrors.join(", ") || "Invalid input", 422);
  }

  const data = parsed.data;
  await dbConnect();

  const [account, source] = await Promise.all([
    BankAccount.findOne({ _id: data.accountId, userId: user.id }),
    IncomeSource.findOne({ _id: data.sourceId, userId: user.id }),
  ]);

  if (!account) {
    return errorResponse("Account not found", 400);
  }

  if (!source) {
    return errorResponse("Income source not found", 400);
  }

  // Use a session for transaction
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const [income] = await Income.create([{
      userId: user.id,
      amount: data.amount,
      description: data.description ?? null,
      notes: data.notes ?? null,
      date: data.date,
      sourceId: data.sourceId,
      accountId: data.accountId,
    }], { session });

    await BankAccount.findByIdAndUpdate(
      account._id,
      { $inc: { balance: data.amount } },
      { session }
    );

    await session.commitTransaction();

    // Populate for response
    await income.populate(['accountId', 'sourceId']);

    return jsonResponse({
      income: {
        ...income.toObject(),
        id: income._id.toString(),
        account: income.accountId ? { ...income.accountId.toObject(), id: income.accountId._id.toString() } : null,
        source: income.sourceId ? { ...income.sourceId.toObject(), id: income.sourceId._id.toString() } : null,
      }
    }, 201);
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("Income creation error", error);
    // Fallback? Or just fail.
    return errorResponse("Unable to create income", 500);
  } finally {
    if (session) session.endSession();
  }
}
