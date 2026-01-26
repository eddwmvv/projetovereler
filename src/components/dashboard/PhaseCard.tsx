import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PhaseCardProps {
  phase: string;
  count: number;
  total: number;
  color: 'blue' | 'yellow' | 'green' | 'gray';
}

const colorStyles = {
  blue: {
    bg: 'bg-primary/10',
    bar: 'bg-primary',
    text: 'text-primary',
  },
  yellow: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    bar: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
  },
  green: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    bar: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  gray: {
    bg: 'bg-muted',
    bar: 'bg-muted-foreground',
    text: 'text-muted-foreground',
  },
};

export const PhaseCard = ({ phase, count, total, color }: PhaseCardProps) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const styles = colorStyles[color];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {phase}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className={cn('text-3xl font-bold', styles.text)}>{count}</span>
          <span className="text-sm text-muted-foreground">alunos</span>
        </div>
        <div className="space-y-1">
          <div className={cn('h-2 rounded-full overflow-hidden', styles.bg)}>
            <div
              className={cn('h-full rounded-full transition-all duration-500', styles.bar)}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {percentage.toFixed(1)}% do total
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
