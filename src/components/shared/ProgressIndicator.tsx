import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'compact' | 'full';
  className?: string;
  status?: 'loading' | 'success' | 'error';
}

export function ProgressIndicator({
  progress,
  label,
  showPercentage = true,
  variant = 'default',
  className,
  status = 'loading',
}: ProgressIndicatorProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {status === 'loading' && (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        )}
        <div className="flex-1">
          <Progress value={clampedProgress} className="h-2" />
        </div>
        {showPercentage && (
          <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <Card className={cn(className)}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {label && (
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{label}</h3>
                {showPercentage && (
                  <span className="text-sm text-muted-foreground">
                    {Math.round(clampedProgress)}%
                  </span>
                )}
              </div>
            )}
            <Progress value={clampedProgress} className="h-3 transition-all duration-300 ease-out" />
            {status === 'loading' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processando...</span>
              </div>
            )}
            {status === 'success' && (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Concluído!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{label}</span>
          {showPercentage && (
            <span className="text-muted-foreground">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <Progress value={clampedProgress} />
    </div>
  );
}
