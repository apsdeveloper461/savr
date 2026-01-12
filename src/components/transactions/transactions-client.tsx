"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { incomeSchema, expenseSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

import type { z } from "zod";

type IncomeFormValues = z.input<typeof incomeSchema>;
type ExpenseFormValues = z.input<typeof expenseSchema>;

type AccountShape = {
  id: string;
  name: string;
  type: string;
  balance: number;
};

type IncomeSourceShape = {
  id: string;
  name: string;
};

type CategoryShape = {
  id: string;
  name: string;
};

type IncomeWithRelations = {
  id: string;
  amount: number;
  date: Date | string;
  account: AccountShape;
  source: IncomeSourceShape;
};

type ExpenseWithRelations = {
  id: string;
  amount: number;
  date: Date | string;
  account: AccountShape;
  category: CategoryShape;
};

type TransactionsClientProps = {
  accounts: AccountShape[];
  incomeSources: IncomeSourceShape[];
  categories: CategoryShape[];
  recentIncome: IncomeWithRelations[];
  recentExpenses: ExpenseWithRelations[];
};

export const TransactionsClient = ({
  accounts,
  incomeSources,
  categories,
  recentIncome,
  recentExpenses,
}: TransactionsClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPanel = searchParams.get("panel") === "expense" ? "expense" : "income";
  const [panel, setPanel] = useState<"income" | "expense">(initialPanel);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => a.name.localeCompare(b.name)),
    [accounts],
  );
  const sortedSources = useMemo(
    () => [...incomeSources].sort((a, b) => a.name.localeCompare(b.name)),
    [incomeSources],
  );
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );

  const incomeForm = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: 0,
      description: "",
      notes: "",
      date: new Date().toISOString().slice(0, 10),
      sourceId: sortedSources[0]?.id ?? "",
      accountId: sortedAccounts[0]?.id ?? "",
    },
  });

  const expenseForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      description: "",
      merchant: "",
      notes: "",
      date: new Date().toISOString().slice(0, 10),
      categoryId: sortedCategories[0]?.id ?? "",
      accountId: sortedAccounts[0]?.id ?? "",
    },
  });

  const hasAccounts = sortedAccounts.length > 0;
  const hasSources = sortedSources.length > 0;
  const hasCategories = sortedCategories.length > 0;
  const incomeDisabled = !hasAccounts || !hasSources;
  const expenseDisabled = !hasAccounts || !hasCategories;

  const handlePanelChange = (next: "income" | "expense") => {
    setPanel(next);
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const formatDateInputValue = (value: string | number | Date | null | undefined) => {
    if (!value) {
      return "";
    }
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    if (typeof value === "number") {
      return new Date(value).toISOString().slice(0, 10);
    }
    return value;
  };

  const incomeDateField = incomeForm.register("date", { valueAsDate: true });
  const expenseDateField = expenseForm.register("date", { valueAsDate: true });
  const incomeDateValue = formatDateInputValue(incomeForm.watch("date") as string | number | Date | null | undefined);
  const expenseDateValue = formatDateInputValue(expenseForm.watch("date") as string | number | Date | null | undefined);

  const handleIncomeSubmit = incomeForm.handleSubmit(async (values) => {
    try {
      if (incomeDisabled) {
        setStatusMessage(null);
        setErrorMessage("Add at least one account and one income source first.");
        return;
      }
      setErrorMessage(null);
      setStatusMessage(null);
      const response = await fetch("/api/incomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to record income");
      }
      setStatusMessage("Income recorded successfully.");
      incomeForm.reset({
        amount: 0,
        description: "",
        notes: "",
        date: new Date().toISOString().slice(0, 10),
        sourceId: sortedSources[0]?.id ?? "",
        accountId: sortedAccounts[0]?.id ?? "",
      });
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  });

  const handleExpenseSubmit = expenseForm.handleSubmit(async (values) => {
    try {
      if (expenseDisabled) {
        setStatusMessage(null);
        setErrorMessage("Add at least one account and one category first.");
        return;
      }
      setErrorMessage(null);
      setStatusMessage(null);
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to record expense");
      }
      setStatusMessage("Expense recorded successfully.");
      expenseForm.reset({
        amount: 0,
        description: "",
        merchant: "",
        notes: "",
        date: new Date().toISOString().slice(0, 10),
        categoryId: sortedCategories[0]?.id ?? "",
        accountId: sortedAccounts[0]?.id ?? "",
      });
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Quick capture</CardTitle>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Log income and expenses in seconds. Accounts and balances update automatically.
            </p>
          </div>
          <div className="flex gap-2 rounded-full bg-zinc-100 p-1 text-sm dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => handlePanelChange("income")}
              className={`rounded-full px-4 py-2 transition ${panel === "income" ? "bg-white font-medium text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"}`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => handlePanelChange("expense")}
              className={`rounded-full px-4 py-2 transition ${panel === "expense" ? "bg-white font-medium text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"}`}
            >
              Expense
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {statusMessage && <p className="mb-3 text-sm text-emerald-600">{statusMessage}</p>}
          {errorMessage && <p className="mb-3 text-sm text-red-500">{errorMessage}</p>}

          {panel === "income" ? (
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleIncomeSubmit}>
              {incomeDisabled && (
                <p className="sm:col-span-2 text-sm text-amber-600">
                  Add an income source and bank account before recording income.
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="income-amount">Amount</Label>
                <Input
                  id="income-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={incomeDisabled}
                  {...incomeForm.register("amount", { valueAsNumber: true })}
                />
                {incomeForm.formState.errors.amount && (
                  <p className="text-xs text-red-500">{incomeForm.formState.errors.amount.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-date">Date</Label>
                <Input
                  id="income-date"
                  type="date"
                  value={incomeDateValue}
                  onChange={(event) => incomeDateField.onChange(event)}
                  onBlur={incomeDateField.onBlur}
                  name={incomeDateField.name}
                  ref={incomeDateField.ref}
                  disabled={incomeDisabled}
                />
                {incomeForm.formState.errors.date && (
                  <p className="text-xs text-red-500">{incomeForm.formState.errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-source">Source</Label>
                <Select
                  id="income-source"
                  defaultValue={incomeForm.getValues("sourceId") || sortedSources[0]?.id}
                  disabled={incomeDisabled}
                  {...incomeForm.register("sourceId")}
                >
                  {sortedSources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </Select>
                {incomeForm.formState.errors.sourceId && (
                  <p className="text-xs text-red-500">{incomeForm.formState.errors.sourceId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-account">Deposit to</Label>
                <Select
                  id="income-account"
                  defaultValue={incomeForm.getValues("accountId") || sortedAccounts[0]?.id}
                  disabled={incomeDisabled}
                  {...incomeForm.register("accountId")}
                >
                  {sortedAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Select>
                {incomeForm.formState.errors.accountId && (
                  <p className="text-xs text-red-500">{incomeForm.formState.errors.accountId.message}</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="income-notes">Notes (optional)</Label>
                <Textarea id="income-notes" rows={3} disabled={incomeDisabled} {...incomeForm.register("notes")} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" isLoading={incomeForm.formState.isSubmitting} disabled={incomeDisabled}>
                  Save income
                </Button>
              </div>
            </form>
          ) : (
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleExpenseSubmit}>
              {expenseDisabled && (
                <p className="sm:col-span-2 text-sm text-amber-600">
                  Add a spending category and bank account before recording an expense.
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={expenseDisabled}
                  {...expenseForm.register("amount", { valueAsNumber: true })}
                />
                {expenseForm.formState.errors.amount && (
                  <p className="text-xs text-red-500">{expenseForm.formState.errors.amount.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-date">Date</Label>
                <Input
                  id="expense-date"
                  type="date"
                  value={expenseDateValue}
                  onChange={(event) => expenseDateField.onChange(event)}
                  onBlur={expenseDateField.onBlur}
                  name={expenseDateField.name}
                  ref={expenseDateField.ref}
                  disabled={expenseDisabled}
                />
                {expenseForm.formState.errors.date && (
                  <p className="text-xs text-red-500">{expenseForm.formState.errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-category">Category</Label>
                <Select
                  id="expense-category"
                  defaultValue={expenseForm.getValues("categoryId") || sortedCategories[0]?.id}
                  disabled={expenseDisabled}
                  {...expenseForm.register("categoryId")}
                >
                  {sortedCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                {expenseForm.formState.errors.categoryId && (
                  <p className="text-xs text-red-500">{expenseForm.formState.errors.categoryId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-account">Paid from</Label>
                <Select
                  id="expense-account"
                  defaultValue={expenseForm.getValues("accountId") || sortedAccounts[0]?.id}
                  disabled={expenseDisabled}
                  {...expenseForm.register("accountId")}
                >
                  {sortedAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </Select>
                {expenseForm.formState.errors.accountId && (
                  <p className="text-xs text-red-500">{expenseForm.formState.errors.accountId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-merchant">Merchant</Label>
                <Input
                  id="expense-merchant"
                  placeholder="Where did you spend?"
                  disabled={expenseDisabled}
                  {...expenseForm.register("merchant")}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="expense-notes">Notes (optional)</Label>
                <Textarea id="expense-notes" rows={3} disabled={expenseDisabled} {...expenseForm.register("notes")} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" isLoading={expenseForm.formState.isSubmitting} disabled={expenseDisabled}>
                  Save expense
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent income</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentIncome.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No income recorded yet.</p>
            )}
            {recentIncome.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <div className="space-y-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{entry.source.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{entry.account.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-300">{formatCurrency(entry.amount)}</p>
                  <p className="text-xs text-zinc-400">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentExpenses.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No expenses recorded yet.</p>
            )}
            {recentExpenses.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <div className="space-y-1">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{entry.category.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{entry.account.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-500">{formatCurrency(entry.amount)}</p>
                  <p className="text-xs text-zinc-400">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
