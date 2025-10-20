import { Card } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from "recharts";
import { useLanguage } from "@/hooks/useLanguage";

export interface PCAScore {
  sample: string;
  pc1: number;
  pc2: number;
  pc3?: number;
  group: number;
}

export interface PCAResult {
  scores: PCAScore[];
  explainedVariance: number[];
  cumulativeVariance: number[];
}

interface PCAResultsProps {
  results: PCAResult;
}

export const PCAResults = ({ results }: PCAResultsProps) => {
  const { t } = useLanguage();
  
  const screePlotData = results.explainedVariance.map((variance, index) => ({
    pc: `PC${index + 1}`,
    variance: variance,
    cumulative: results.cumulativeVariance[index],
  }));

  const groupColors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Scores Plot */}
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">{t('pca.scoresPlot')}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              dataKey="pc1" 
              name="PC1" 
              label={{ value: `PC1 (${results.explainedVariance[0]?.toFixed(1)}%)`, position: 'bottom', fill: 'hsl(var(--foreground))' }}
              stroke="hsl(var(--foreground))"
            />
            <YAxis 
              type="number" 
              dataKey="pc2" 
              name="PC2"
              label={{ value: `PC2 (${results.explainedVariance[1]?.toFixed(1)}%)`, angle: -90, position: 'left', fill: 'hsl(var(--foreground))' }}
              stroke="hsl(var(--foreground))"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            {Array.from(new Set(results.scores.map(s => s.group))).map((group, idx) => (
              <Scatter
                key={group}
                name={`Group ${group}`}
                data={results.scores.filter(s => s.group === group)}
                fill={groupColors[idx % groupColors.length]}
                shape="circle"
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      {/* Scree Plot */}
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">{t('pca.screePlot')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={screePlotData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="pc" stroke="hsl(var(--foreground))" />
            <YAxis 
              yAxisId="left"
              label={{ value: t('pca.varianceExplained') + ' (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
              stroke="hsl(var(--foreground))"
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              label={{ value: t('pca.cumulativeVariance') + ' (%)', angle: 90, position: 'insideRight', fill: 'hsl(var(--foreground))' }}
              stroke="hsl(var(--foreground))"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="variance" fill="hsl(var(--primary))" name={t('pca.varianceExplained')} />
            <Bar yAxisId="right" dataKey="cumulative" fill="hsl(var(--chart-2))" name={t('pca.cumulativeVariance')} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
