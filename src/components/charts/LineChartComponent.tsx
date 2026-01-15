import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface LineChartComponentProps {
  data: { name: string; value: number; count?: number }[];
  title: string;
}

function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} Mrd`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)} M`;
  }
  return `${(value / 1000).toFixed(0)} E`;
}

export function LineChartComponent({ data, title }: LineChartComponentProps) {
  return (
    <div className="stat-card">
      <h3 className="mb-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(45, 100%, 51%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(45, 100%, 51%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [
                new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(value),
                'Támogatás'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(45, 100%, 51%)" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
