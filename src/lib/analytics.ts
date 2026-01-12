import { endOfMonth, endOfYear, startOfMonth, startOfYear, subMonths } from "date-fns";
import dbConnect from "@/lib/db";
import { BankAccount as BankAccountModel, Category as CategoryModel } from "@/models/core";
import { Income as IncomeModel, Expense as ExpenseModel, SavingGoal as SavingGoalModel } from "@/models/transactions";
import mongoose from "mongoose";

// Helper for aggregation sum
async function getSum(model: any, userId: string, startDate?: Date, endDate?: Date) {
  const match: any = { userId: new mongoose.Types.ObjectId(userId) }; // Ensure ObjectIDs match
  if (startDate && endDate) {
    match.date = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    match.date = { $gte: startDate };
  } else if (endDate) {
    match.date = { $lte: endDate };
  }

  const result = await model.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  return result[0]?.total || 0;
}

export const getDashboardMetrics = async (userId: string) => {
  await dbConnect();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  const [
    incomeTotal,
    expenseTotal,
    monthIncome,
    monthExpense,
    yearIncome,
    yearExpense,
    goals,
    accounts
  ] = await Promise.all([
    getSum(IncomeModel, userId),
    getSum(ExpenseModel, userId),
    getSum(IncomeModel, userId, monthStart, monthEnd),
    getSum(ExpenseModel, userId, monthStart, monthEnd),
    getSum(IncomeModel, userId, yearStart, yearEnd),
    getSum(ExpenseModel, userId, yearStart, yearEnd),
    SavingGoalModel.find({ userId }).lean(),
    BankAccountModel.find({ userId }).lean(),
  ]);

  const currentSavings = incomeTotal - expenseTotal;
  const monthlySavings = monthIncome - monthExpense;
  const yearlySavings = yearIncome - yearExpense;

  const monthGoalAlert = goals
    .filter((goal: any) => goal.type === "monthly")
    .map((goal: any) => {
      const progress = goal.targetAmount
        ? Math.min(100, Math.round(((goal.currentAmount ?? 0) / goal.targetAmount) * 100))
        : 0;
      const atRisk = goal.targetAmount ? (goal.currentAmount ?? 0) < goal.targetAmount * 0.75 : false;
      return { id: goal._id.toString(), name: goal.name, progress, atRisk };
    });

  const lowBalanceAccounts = accounts
    .filter((account: any) => account.balance < 50)
    .map((account: any) => ({ id: account._id.toString(), name: account.name, balance: account.balance }));

  return {
    totals: {
      income: incomeTotal,
      expenses: expenseTotal,
      savings: currentSavings,
    },
    monthly: {
      income: monthIncome,
      expenses: monthExpense,
      savings: monthlySavings,
    },
    yearly: {
      income: yearIncome,
      expenses: yearExpense,
      savings: yearlySavings,
    },
    goals: goals.map((goal: any) => ({
      id: goal._id.toString(),
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
  await dbConnect();

  const expenses = await ExpenseModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: "$categoryId",
        amount: { $sum: "$amount" }
      }
    }
  ]);

  const categoryIds = expenses.map(e => e._id);
  const categories = await CategoryModel.find({ _id: { $in: categoryIds } }).lean();

  return expenses.map((item: any) => {
    const category = categories.find((c: any) => c._id.toString() === item._id.toString());
    return {
      id: item._id.toString(),
      name: category?.name ?? "Uncategorised",
      amount: item.amount || 0,
      icon: category?.icon ?? null,
      color: category?.color ?? null,
    };
  });
};

export const getIncomeVsExpenseTrend = async (userId: string, months = 6) => {
  await dbConnect();

  const now = new Date();
  const start = startOfMonth(subMonths(now, months - 1));

  // Efficient projection usage
  const [incomeEntries, expenseEntries] = await Promise.all([
    IncomeModel.find({
      userId,
      date: { $gte: start, $lte: now }
    }).select('date amount').lean(),
    ExpenseModel.find({
      userId,
      date: { $gte: start, $lte: now }
    }).select('date amount').lean(),
  ]);

  const mapByMonth = (
    entries: Array<{ date: Date; amount: number }>,
  ) => {
    return entries.reduce<Record<string, number>>((accumulator, item) => {
      const key = `${new Date(item.date).getFullYear()}-${new Date(item.date).getMonth() + 1}`;
      accumulator[key] = (accumulator[key] ?? 0) + item.amount;
      return accumulator;
    }, {});
  };

  const incomeByMonth = mapByMonth(incomeEntries as any); // Type cast due to lean() return typical object
  const expenseByMonth = mapByMonth(expenseEntries as any);

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
  await dbConnect();

  const [incomeSum, expenseSum, incomeCount, expenseCount, goals] = await Promise.all([
    getSum(IncomeModel, userId, start, end),
    getSum(ExpenseModel, userId, start, end),
    IncomeModel.countDocuments({ userId, date: { $gte: start, $lte: end } }),
    ExpenseModel.countDocuments({ userId, date: { $gte: start, $lte: end } }),
    SavingGoalModel.find({ userId }).lean(),
  ]);

  return {
    income: { total: incomeSum, count: incomeCount },
    expenses: { total: expenseSum, count: expenseCount },
    savings: incomeSum - expenseSum,
    goals: goals.map((g: any) => ({ ...g, id: g._id.toString() })),
  };
};
