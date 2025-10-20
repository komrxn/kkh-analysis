import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ResponsiveContainer, ComposedChart, Bar, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export interface BoxplotData {
  group: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  values: number[];
}

interface InteractiveBoxplotProps {
  data: BoxplotData[];
  variable: string;
}

export const InteractiveBoxplot = ({ data, variable }: InteractiveBoxplotProps) => {
  // Transform data for recharts
  const chartData = data.map(group => ({
    name: group.group,
    range: [group.min, group.max],
    box: [group.q1, group.q3],
    median: group.median,
    values: group.values,
  }));

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader>
        <CardTitle>{variable}</CardTitle>
        <CardDescription>Интерактивный Boxplot с точками данных</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--foreground))"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis 
              stroke="hsl(var(--foreground))"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Legend />
            <Bar 
              dataKey="box" 
              fill="hsl(var(--primary))" 
              fillOpacity={0.6}
              name="IQR (Q1-Q3)"
            />
            <Scatter 
              dataKey="median" 
              fill="hsl(var(--accent))" 
              name="Median"
              shape="diamond"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
