"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

export type TrendDatum = {
  month: string;
  income: number;
  expense: number;
};

export const TrendAreaChart = ({ data }: { data: TrendDatum[] }) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#a1a1aa" tickLine={false} axisLine={false} />
        <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} width={90} />
        <Tooltip
          formatter={(value?: number | string) =>
            formatCurrency(typeof value === "number" ? value : Number(value ?? 0))
          }
          contentStyle={{ borderRadius: 16, border: "1px solid #e5e7eb" }}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#22c55e"
          strokeWidth={2.5}
          fill="url(#incomeGradient)"
          activeDot={{ r: 6 }}
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          strokeWidth={2.5}
          fill="url(#expenseGradient)"
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
