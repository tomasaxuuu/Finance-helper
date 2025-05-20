// components/ExpensesPieChart.tsx
import { FC, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  transactions: any[];
}

const COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4CAF50",
  "#FF9800",
  "#9C27B0",
  "#00ACC1",
];

const ExpensesPieChart: FC<Props> = ({ transactions }) => {
  const data = useMemo(() => {
    const categoryMap: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.type !== "expense") return;
      const category = tx.category?.name || "Без категории";
      categoryMap[category] =
        (categoryMap[category] || 0) + parseFloat(tx.amount);
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [transactions]);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h3 style={{ textAlign: "center", marginBottom: "16px" }}>
        🧁 Расходы по категориям
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart margin={{ bottom: 60 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            innerRadius={60}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensesPieChart;
