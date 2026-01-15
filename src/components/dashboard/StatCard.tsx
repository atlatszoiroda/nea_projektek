import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantStyles = {
  default: 'text-muted-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
};

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  variant = 'default' 
}: StatCardProps) {
  return (
    <div className="stat-card group animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-display text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`rounded-lg bg-muted p-3 transition-colors group-hover:bg-primary/10 ${variantStyles[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
