import { memo, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart } from "lucide-react";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  icon?: React.ReactNode;
  description?: string;
  valueClassName?: string;
}

export const MetricCard = ({
  title,
  value,
  unit = "",
  icon,
  description,
  valueClassName,
}: MetricCardProps) => (
  <Card className="flex-1">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${valueClassName || ""}`}>
        {unit}
        {typeof value === "number"
          ? value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0.00"}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

interface RealtimeChartProps {
  data: any[];
  title: string;
  dataKey: string;
  lineColor: string;
  tooltipFormatter: (value: number) => string;
  legendName: string;
}

export const RealtimeChart = memo(
  ({
    data,
    title,
    dataKey,
    lineColor,
    tooltipFormatter,
    legendName,
  }: RealtimeChartProps) => {
    const chartData = useMemo(() => {
      const validData = data || [];
      if (validData.length === 0) return [];

      const filteredData = validData.filter((point: any) => {
        if (!point.time) return false;
        return true;
      });

      return filteredData.length > 0 ? filteredData : validData.slice(-10);
    }, [data]);

    const chartKey = useMemo(
      () => `chart-${title}-${dataKey}`,
      [title, dataKey],
    );

    const isDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const colors = {
      grid: isDark ? "#374151" : "#e5e7eb",
      axis: isDark ? "#9ca3af" : "#6b7280",
      tooltipBg: isDark ? "#1f2937" : "#ffffff",
      tooltipBorder: isDark ? "#374151" : "#d1d5db",
      tooltipText: isDark ? "#f9fafb" : "#111827",
      legend: isDark ? "#9ca3af" : "#6b7280",
      cursor:
        lineColor === "#3b82f6" || lineColor.includes("primary")
          ? "#3b82f6"
          : "#8b5cf6",
    };

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: "350px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                key={chartKey}
                data={chartData}
                margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={colors.grid}
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="time"
                  stroke={colors.axis}
                  fontSize={12}
                  interval="preserveStartEnd"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(tick) => {
                    if (typeof tick === "string" && tick.includes(":")) {
                      const parts = tick.split(":");
                      return parts.length >= 3
                        ? `${parts[1]}:${parts[2]}`
                        : tick;
                    }
                    return tick;
                  }}
                  domain={["dataMin", "dataMax"]}
                />
                <YAxis
                  stroke={colors.axis}
                  fontSize={12}
                  tickFormatter={
                    tooltipFormatter || ((value) => value.toString())
                  }
                />
                <RechartsTooltip
                  cursor={{ stroke: colors.cursor, strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: colors.tooltipBg,
                    borderColor: colors.tooltipBorder,
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{ color: colors.tooltipText }}
                  labelStyle={{ color: colors.legend }}
                  formatter={
                    tooltipFormatter
                      ? (value: any) => {
                          const numValue =
                            typeof value === "number"
                              ? value
                              : parseFloat(String(value)) || 0;
                          return [tooltipFormatter(numValue), legendName];
                        }
                      : undefined
                  }
                />
                <Legend
                  wrapperStyle={{ color: colors.legend, paddingTop: "10px" }}
                />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={false}
                  name={legendName}
                  connectNulls={false}
                  isAnimationActive={chartData.length <= 1}
                  animationBegin={0}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  },
);

RealtimeChart.displayName = "RealtimeChart";
