import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export default async function TransactionsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({
      where: { userId: user.id },
      include: {
        account: true,
        source: true,
      },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.expense.findMany({
      where: { userId: user.id },
      include: {
        account: true,
        category: true,
      },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ]);

  return (
    <TransactionsClient
      accounts={user.accounts}
      incomeSources={user.incomeSources}
      categories={user.categories}
      recentIncome={incomes}
      recentExpenses={expenses}
    />
  );
}
