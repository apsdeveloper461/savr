"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

export type CategorySlice = {
  id: string;
  name: string;
  amount: number;
  color?: string | null;
};

const fallbackPalette = ["#22c55e", "#3b82f6", "#f97316", "#a855f7", "#ec4899", "#14b8a6", "#facc15"];

export const CategoryPieChart = ({ data }: { data: CategorySlice[] }) => {
  const total = data.reduce((acc, item) => acc + item.amount, 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell key={entry.id} fill={entry.color ?? fallbackPalette[index % fallbackPalette.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value?: number | string, name?: string) => [
            formatCurrency(typeof value === "number" ? value : Number(value ?? 0)),
            name,
          ]}
          contentStyle={{ borderRadius: 16, border: "1px solid #e5e7eb" }}
        />
        {total === 0 && (
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#a1a1aa" fontSize={12}>
            No expenses yet
          </text>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};
