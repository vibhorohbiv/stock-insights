"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { SectorAllocation } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function SectorBarChart({ data }: { data: SectorAllocation[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 47% 13%)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => `${v.toFixed(0)}%`}
          tick={{ fill: "hsl(215 16% 57%)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="sector"
          tick={{ fill: "hsl(215 16% 57%)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(222 47% 9%)",
            border: "1px solid hsl(222 47% 15%)",
            borderRadius: "8px",
            color: "hsl(213 31% 91%)",
            fontSize: 12,
          }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, "Allocation"]}
        />
        <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
