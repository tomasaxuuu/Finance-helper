import { FC, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Transaction {
  amount: number;
  type: "income" | "expense";
  date: string;
}

interface Props {
  transactions: Transaction[];
}

const MonthlyChart: FC<Props> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const grouped: Record<
      string,
      { income: number; expense: number; date: Date }
    > = {};

    transactions.forEach((tx) => {
      if (!tx.date) return;
      const txDate = new Date(tx.date);
      const key = `${txDate.getFullYear()}-${txDate.getMonth() + 1}`;

      if (!grouped[key]) {
        grouped[key] = {
          income: 0,
          expense: 0,
          date: new Date(txDate.getFullYear(), txDate.getMonth(), 1),
        };
      }

      const amount = parseFloat(tx.amount.toString());
      if (tx.type === "income") {
        grouped[key].income += amount;
      } else if (tx.type === "expense") {
        grouped[key].expense += amount;
      }
    });

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        month: item.date.toLocaleString("default", {
          year: "numeric",
          month: "short",
        }),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transactions]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "800px",
        height: 300,
        margin: "0 auto",
      }}
    >
      <h3>Доходы и расходы по месяцам</h3>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 50, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#4caf50"
            name="Доходы"
          />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#f44336"
            name="Расходы"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyChart;
