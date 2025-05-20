// components/ActivityHeatmap.tsx
import { FC, useMemo } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subDays, format } from "date-fns";

interface Props {
  transactions: any[];
}

const ActivityHeatmap: FC<Props> = ({ transactions }) => {
  const today = new Date();

  const data = useMemo(() => {
    const map: Record<string, number> = {};

    transactions.forEach((tx) => {
      const dateStr = tx.date?.slice(0, 10); // 'YYYY-MM-DD'
      if (!dateStr) return;
      map[dateStr] = (map[dateStr] || 0) + 1;
    });

    return Object.entries(map).map(([date, count]) => ({
      date,
      count,
    }));
  }, [transactions]);

  return (
    <div style={{ padding: "20px" }}>
      <h3 style={{ textAlign: "center", marginBottom: "12px" }}>
        📆 Активность по дням
      </h3>
      <CalendarHeatmap
        startDate={subDays(today, 180)}
        endDate={today}
        values={data}
        classForValue={(value: { count: number }) => {
          if (!value) return "color-empty";
          if (value.count >= 10) return "color-github-4";
          if (value.count >= 5) return "color-github-3";
          if (value.count >= 2) return "color-github-2";
          return "color-github-1";
        }}
        tooltipDataAttrs={(value: any) => {
          if (!value?.date) return null;
          return {
            "data-tip": `${value.date}: ${value.count} операций`,
          };
        }}
        showWeekdayLabels
      />
    </div>
  );
};

export default ActivityHeatmap;
