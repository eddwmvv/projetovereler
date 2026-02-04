import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  variant?: 'empresas' | 'projetos' | 'municipios' | 'escolas' | 'alunos';
  onClick?: () => void;
  href?: string;
  compact?: boolean;
  sparklineData?: number[];
  sparklineColor?: string;
}

const cardVariants = {
  empresas: {
    icon: 'bg-blue-100 text-blue-600',
  },
  projetos: {
    icon: 'bg-emerald-100 text-emerald-600',
  },
  municipios: {
    icon: 'bg-amber-100 text-amber-600',
  },
  escolas: {
    icon: 'bg-rose-100 text-rose-600',
  },
  alunos: {
    icon: 'bg-violet-100 text-violet-600',
  },
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  variant = 'empresas',
  onClick,
  href,
  compact = false,
}: StatCardProps) => {
  const isClickable = onClick || href;
  const styles = cardVariants[variant];

  const content = (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 group h-full',
      'border bg-white hover:shadow-lg',
      isClickable ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' : ''
    )}>
      <CardContent className={cn("relative", compact ? "p-4" : "p-6")}>
        <div className="flex items-start justify-between mb-6">
          {/* Ícone Grande e Colorido */}
          <div className={cn(
            'rounded-xl flex items-center justify-center flex-shrink-0',
            compact ? 'w-10 h-10' : 'w-14 h-14',
            styles.icon
          )}>
            <Icon className={cn(compact ? "w-6 h-6" : "w-8 h-8")} />
          </div>

          {/* Trend Indicator */}
          {trend && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-50">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-600">
                +{trend.value.toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        {/* Value - Destaque Principal */}
        <div className="mb-3">
          <span className={cn(
            "font-bold text-gray-900 block",
            compact ? "text-2xl" : "text-4xl"
          )}>
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </span>
        </div>

        {/* Title e Subtitle */}
        <div className="space-y-0.5">
          <p className={cn(
            "font-semibold text-gray-900",
            compact ? "text-xs" : "text-sm"
          )}>
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className="block">
        {content}
      </div>
    );
  }

  return content;
};
