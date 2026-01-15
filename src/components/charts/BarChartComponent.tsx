import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface BarChartComponentProps {
  data: { name: string; value: number; count?: number; varos?: string; besorolas?: string }[];
  title: string;
  dataKey?: string;
  color?: string;
  formatValue?: (value: number) => string;
  height?: number;
  tooltipLabel?: string;
  yAxisWidth?: number;
}

const COLORS = [
  'hsl(45, 100%, 51%)',
  'hsl(45, 80%, 45%)',
  'hsl(35, 100%, 45%)',
  'hsl(199, 89%, 48%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
];

function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1).replace('.', ',')}\u00A0Mrd\u00A0Ft`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0).replace('.', ',')}\u00A0M\u00A0Ft`;
  }
  return `${(value / 1000).toFixed(0).replace('.', ',')}\u00A0E\u00A0Ft`;
}


export function BarChartComponent({
  data,
  title,
  formatValue = formatCurrency,
  height = 300,
  tooltipLabel = 'Összeg',
  yAxisWidth = 180,
  dataKey = 'value'
}: BarChartComponentProps) {
  // Find max value to set domain padding
  const maxValue = Math.max(...data.map(d => (d as any)[dataKey] || 0));

  const ticks = useMemo(() => {
    if (maxValue === 0) return [0];

    // Calculate a nice step size
    // We want roughly 5-7 ticks
    const targetTickCount = 5;
    const roughStep = maxValue / (targetTickCount - 1);

    // Powers of 10 to normalize
    const power = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalizedStep = roughStep / power;

    // Pick a nice normalized step
    let niceNormalizedStep;
    if (normalizedStep < 1.5) niceNormalizedStep = 1;
    else if (normalizedStep < 2.5) niceNormalizedStep = 2;
    else if (normalizedStep < 5) niceNormalizedStep = 5;
    else niceNormalizedStep = 10;

    const step = niceNormalizedStep * power;

    // Generate ticks
    const result = [];
    let current = 0;
    // We go one step past the max value to ensure it's covered nicely
    while (current <= maxValue || (current - step < maxValue)) {
      result.push(current);
      current += step;
      // Safety break to prevent infinite loops if step is 0 (shouldn't happen)
      if (current > maxValue * 2) break;
    }

    return result;
  }, [maxValue]);

  const domainMax = ticks[ticks.length - 1];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          boxShadow: '0 8px 32px -8px hsl(0 0% 0% / 0.4)',
          padding: '12px',
          color: 'hsl(var(--foreground))',
          transform: 'translateX(-100%)',
          pointerEvents: 'none',
          maxWidth: '300px',
          width: 'max-content',
          whiteSpace: 'normal',
          wordWrap: 'break-word'
        }}>
          <p className="font-semibold mb-2 leading-tight">{label}</p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">{tooltipLabel}: </span>
              <span className="font-medium text-primary">{formatValue(payload[0].value)}</span>
            </p>
            {data.varos && (
              <p>
                <span className="text-muted-foreground">Város: </span>
                <span className="font-medium">{data.varos}</span>
              </p>
            )}
            {data.besorolas && (
              <p>
                <span className="text-muted-foreground">Besorolás: </span>
                <span className="font-medium">{data.besorolas}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="stat-card">
      <h3 className="mb-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 80, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickFormatter={formatValue}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              domain={[0, domainMax]}
              ticks={ticks}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={yAxisWidth}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />
            <Bar dataKey={dataKey} radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
              ))}
              <LabelList
                dataKey={dataKey}
                position="right"
                formatter={formatValue}
                style={{ fill: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
