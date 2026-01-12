import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Income, Expense } from "@/models/transactions";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  await dbConnect();

  const [incomes, expenses] = await Promise.all([
    Income.find({ userId: user.id })
      .populate('accountId')
      .populate('sourceId')
      .sort({ date: "desc" })
      .limit(10)
      .lean(),
    Expense.find({ userId: user.id })
      .populate('accountId')
      .populate('categoryId')
      .sort({ date: "desc" })
      .limit(10)
      .lean(),
  ]);

  // Serialize and format
  const formattedIncomes = incomes.map((i: any) => ({
    ...i,
    id: i._id.toString(),
    date: i.date, // Date is already Date object, Client Component serialization might need string, let's see. Next.js can serialize Dates now in most cases, but string is safest. 
    // Usually Next.js 13+ RSC -> SC passes Dates fine, but RSC -> Client needs serialization.
    // The previous code passed Date objects from Prisma? Yes.
    account: i.accountId ? { ...i.accountId, id: i.accountId._id.toString() } : null,
    source: i.sourceId ? { ...i.sourceId, id: i.sourceId._id.toString() } : null,
    accountId: i.accountId?._id.toString(),
    sourceId: i.sourceId?._id.toString(),
    _id: undefined // Remove private field
  }));

  const formattedExpenses = expenses.map((e: any) => ({
    ...e,
    id: e._id.toString(),
    date: e.date,
    account: e.accountId ? { ...e.accountId, id: e.accountId._id.toString() } : null,
    category: e.categoryId ? { ...e.categoryId, id: e.categoryId._id.toString() } : null,
    accountId: e.accountId?._id.toString(),
    categoryId: e.categoryId?._id.toString(),
    _id: undefined
  }));

  return (
    <TransactionsClient
      accounts={user.accounts}
      incomeSources={user.incomeSources}
      categories={user.categories}
      recentIncome={formattedIncomes as any}
      recentExpenses={formattedExpenses as any}
    />
  );
}
