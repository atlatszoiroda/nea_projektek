import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartComponentProps {
  data: { name: string; value: number }[];
  title: string;
}

const COLORS = [
  'hsl(45, 100%, 51%)',
  'hsl(142, 76%, 36%)',
  'hsl(0, 72%, 51%)',
  'hsl(199, 89%, 48%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 70%, 50%)',
];

export function PieChartComponent({ data, title }: PieChartComponentProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="stat-card">
      <h3 className="mb-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                `${value.toLocaleString('hu-HU')} db (${((value / total) * 100).toFixed(1)}%)`,
                name
              ]}
            />
            <Legend 
              layout="vertical" 
              align="right" 
              verticalAlign="middle"
              formatter={(value) => (
                <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
