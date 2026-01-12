import { endOfMonth, startOfMonth } from "date-fns";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCategoryBreakdown, getDashboardMetrics, getIncomeVsExpenseTrend } from "@/lib/analytics";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendAreaChart } from "@/components/charts/trend-area-chart";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";

type DashboardMetrics = Awaited<ReturnType<typeof getDashboardMetrics>>;
type CategoryBreakdown = Awaited<ReturnType<typeof getCategoryBreakdown>>;
type TrendSeries = Awaited<ReturnType<typeof getIncomeVsExpenseTrend>>;
type GoalSummary = DashboardMetrics["goals"][number];
type SavingsAlert = DashboardMetrics["alerts"]["savings"][number];
type BalanceAlert = DashboardMetrics["alerts"]["lowBalance"][number];
type UserWithRelations = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
type AccountSummary = UserWithRelations["accounts"][number];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const [metricsRaw, categoriesRaw, trendRaw] = (await Promise.all([
    getDashboardMetrics(user.id),
    getCategoryBreakdown(user.id, startOfMonth(now), endOfMonth(now)),
    getIncomeVsExpenseTrend(user.id, 6),
  ])) as [DashboardMetrics, CategoryBreakdown, TrendSeries];

  const metrics: DashboardMetrics = metricsRaw;
  const categories: CategoryBreakdown = categoriesRaw;
  const trend: TrendSeries = trendRaw;

  const monthlyGoalAlerts: SavingsAlert[] = metrics.alerts.savings;
  const lowBalanceAlerts: BalanceAlert[] = metrics.alerts.lowBalance;
  const accounts: AccountSummary[] = (user.accounts ?? []) as AccountSummary[];
  const totalCategorySpend = categories.reduce(
    (accumulator: number, item: CategoryBreakdown[number]) => accumulator + item.amount,
    0,
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Total income</CardTitle>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">All time</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(metrics.totals.income)}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              +{formatCurrency(metrics.monthly.income)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Total expenses</CardTitle>
            <Badge className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">Managed</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(metrics.totals.expenses)}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {formatCurrency(metrics.monthly.expenses)} spent this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Current savings</CardTitle>
            <Badge className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">Live</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(metrics.totals.savings)}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {formatCurrency(metrics.monthly.savings)} this month • {formatCurrency(metrics.yearly.savings)} YTD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Accounts tracked</CardTitle>
            <Badge className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">Multiple</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatNumber(accounts.length)}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Bank & cash balances in sync</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Income vs expenses</CardTitle>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Last 6 months trend</p>
            </div>
          </CardHeader>
          <CardContent>
            <TrendAreaChart data={trend} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Spending mix</CardTitle>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Current month categories</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CategoryPieChart data={categories} />
            <div className="space-y-3">
              {categories.slice(0, 5).map((category: CategoryBreakdown[number]) => {
                const share = totalCategorySpend ? Math.round((category.amount / totalCategorySpend) * 100) : 0;
                return (
                  <div key={category.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">{category.name}</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatCurrency(category.amount)} · {share}%
                      </span>
                    </div>
                    <Progress value={share} />
                  </div>
                );
              })}
              {categories.length === 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No expenses recorded this month yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Saving goals</CardTitle>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Stay on track with your targets</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.goals.length > 0 ? (
              metrics.goals.map((goal: GoalSummary) => {
                const progress = goal.targetAmount
                  ? Math.min(100, Math.round(((goal.currentAmount ?? 0) / goal.targetAmount) * 100))
                  : 0;
                return (
                  <div key={goal.id} className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">{goal.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {formatCurrency(goal.currentAmount ?? 0)} / {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                      <Badge className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">{goal.type}</Badge>
                    </div>
                    <Progress className="mt-3" value={progress} />
                    <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {goal.deadline ? `Deadline: ${goal.deadline.toLocaleDateString()}` : "No deadline"}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No saving goals yet. Create one to start tracking.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {monthlyGoalAlerts.length === 0 && lowBalanceAlerts.length === 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">You're all caught up. No alerts right now.</p>
              )}

              {monthlyGoalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                >
                  <p className="font-medium">{alert.name}</p>
                  <p className="text-xs">Progress at {alert.progress}% – review your monthly savings plan.</p>
                </div>
              ))}

              {lowBalanceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-xl border border-red-200 bg-red-50/60 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
                >
                  <p className="font-medium">{alert.name} running low</p>
                  <p className="text-xs">Available balance {formatCurrency(alert.balance)} – keep an eye on upcoming payments.</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accounts snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {accounts.slice(0, 4).map((account: AccountSummary) => (
                <div key={account.id} className="flex items-center justify-between rounded-xl bg-zinc-100/60 p-3 text-sm dark:bg-zinc-900/60">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">{account.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{account.type.toUpperCase()}</p>
                  </div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">{formatCurrency(account.balance)}</p>
                </div>
              ))}
              {accounts.length === 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No accounts yet. Create your first bank or cash account.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
