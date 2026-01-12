import { endOfMonth, endOfYear, startOfMonth, startOfYear, subMonths } from "date-fns";
import { prisma } from "./prisma";

type SavingGoalRecord = Awaited<ReturnType<typeof prisma.savingGoal.findMany>>[number];
type AccountRecord = Awaited<ReturnType<typeof prisma.bankAccount.findMany>>[number];
type CategoryRecord = Awaited<ReturnType<typeof prisma.category.findMany>>[number];

export const getDashboardMetrics = async (userId: string) => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  const [incomeTotal, expenseTotal, monthIncome, monthExpense, yearIncome, yearExpense, goals, accounts] =
    await Promise.all([
      prisma.income.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.income.aggregate({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      prisma.income.aggregate({
        where: { userId, date: { gte: yearStart, lte: yearEnd } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId, date: { gte: yearStart, lte: yearEnd } },
        _sum: { amount: true },
      }),
      prisma.savingGoal.findMany({ where: { userId } }),
      prisma.bankAccount.findMany({ where: { userId } }),
    ]);

  const totalIncome = incomeTotal._sum.amount ?? 0;
  const totalExpenses = expenseTotal._sum.amount ?? 0;
  const currentSavings = totalIncome - totalExpenses;

  const monthlySavings = (monthIncome._sum.amount ?? 0) - (monthExpense._sum.amount ?? 0);
  const yearlySavings = (yearIncome._sum.amount ?? 0) - (yearExpense._sum.amount ?? 0);

  const monthGoalAlert = goals
    .filter((goal: SavingGoalRecord) => goal.type === "monthly")
    .map((goal: SavingGoalRecord) => {
      const progress = goal.targetAmount
        ? Math.min(100, Math.round(((goal.currentAmount ?? 0) / goal.targetAmount) * 100))
        : 0;
      const atRisk = goal.targetAmount ? (goal.currentAmount ?? 0) < goal.targetAmount * 0.75 : false;
      return { id: goal.id, name: goal.name, progress, atRisk };
    });

  const lowBalanceAccounts = accounts
    .filter((account: AccountRecord) => account.balance < 50)
    .map((account: AccountRecord) => ({ id: account.id, name: account.name, balance: account.balance }));

  return {
    totals: {
      income: totalIncome,
      expenses: totalExpenses,
      savings: currentSavings,
    },
    monthly: {
      income: monthIncome._sum.amount ?? 0,
      expenses: monthExpense._sum.amount ?? 0,
      savings: monthlySavings,
    },
    yearly: {
      income: yearIncome._sum.amount ?? 0,
      expenses: yearExpense._sum.amount ?? 0,
      savings: yearlySavings,
    },
    goals: goals.map((goal: SavingGoalRecord) => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
      type: goal.type,
      icon: goal.icon,
      color: goal.color,
    })),
    alerts: {
      savings: monthGoalAlert,
      lowBalance: lowBalanceAccounts,
    },
  };
};

export const getCategoryBreakdown = async (userId: string, start: Date, end: Date) => {
  const expenses = await prisma.expense.groupBy({
    by: ["categoryId"],
    where: { userId, date: { gte: start, lte: end } },
    _sum: { amount: true },
  });
  type ExpenseGroup = (typeof expenses)[number];

  const categories = await prisma.category.findMany({
    where: {
      userId,
      id: {
        in: expenses.map((item: ExpenseGroup) => item.categoryId),
      },
    },
  });

  return expenses.map((item: ExpenseGroup) => {
    const category = categories.find((c: CategoryRecord) => c.id === item.categoryId);
    return {
      id: item.categoryId,
      name: category?.name ?? "Uncategorised",
      amount: item._sum.amount ?? 0,
      icon: category?.icon ?? null,
      color: category?.color ?? null,
    };
  });
};

export const getIncomeVsExpenseTrend = async (userId: string, months = 6) => {
  const now = new Date();
  const start = startOfMonth(subMonths(now, months - 1));

  const [incomeEntries, expenseEntries] = await Promise.all([
    prisma.income.findMany({
      where: { userId, date: { gte: start, lte: now } },
      select: { date: true, amount: true },
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: now } },
      select: { date: true, amount: true },
    }),
  ]);

  const mapByMonth = (
    entries: Array<{ date: Date; amount: number }>,
  ) => {
    return entries.reduce<Record<string, number>>((accumulator, item) => {
      const key = `${item.date.getFullYear()}-${item.date.getMonth() + 1}`;
      accumulator[key] = (accumulator[key] ?? 0) + item.amount;
      return accumulator;
    }, {});
  };

  const incomeByMonth = mapByMonth(incomeEntries);
  const expenseByMonth = mapByMonth(expenseEntries);

  const data = [] as Array<{ month: string; income: number; expense: number }>;
  for (let i = months - 1; i >= 0; i -= 1) {
    const monthDate = subMonths(now, i);
    const key = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`;
    data.push({
      month: monthDate.toLocaleString("default", { month: "short" }),
      income: incomeByMonth[key] ?? 0,
      expense: expenseByMonth[key] ?? 0,
    });
  }

  return data;
};

export const getReportSummary = async (
  userId: string,
  start: Date,
  end: Date,
) => {
  const [income, expenses, goals] = await Promise.all([
    prisma.income.aggregate({
      where: { userId, date: { gte: start, lte: end } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { userId, date: { gte: start, lte: end } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.savingGoal.findMany({ where: { userId } }),
  ]);

  const totalIncome = income._sum.amount ?? 0;
  const totalExpenses = expenses._sum.amount ?? 0;

  return {
    income: { total: totalIncome, count: income._count },
    expenses: { total: totalExpenses, count: expenses._count },
    savings: totalIncome - totalExpenses,
    goals,
  };
};
