import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';

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
}

// Estilos sutis e profissionais para cada tipo de estatística
const cardVariants = {
  empresas: {
    card: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700',
    icon: 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300',
    value: 'text-slate-900 dark:text-slate-100',
    title: 'text-slate-700 dark:text-slate-300',
    subtitle: 'text-slate-600 dark:text-slate-400',
  },
  projetos: {
    card: 'bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border-neutral-200 dark:border-neutral-700',
    icon: 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300',
    value: 'text-neutral-900 dark:text-neutral-100',
    title: 'text-neutral-700 dark:text-neutral-300',
    subtitle: 'text-neutral-600 dark:text-neutral-400',
  },
  municipios: {
    card: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700',
    icon: 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300',
    value: 'text-gray-900 dark:text-gray-100',
    title: 'text-gray-700 dark:text-gray-300',
    subtitle: 'text-gray-600 dark:text-gray-400',
  },
  escolas: {
    card: 'bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-800 border-stone-200 dark:border-stone-700',
    icon: 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300',
    value: 'text-stone-900 dark:text-stone-100',
    title: 'text-stone-700 dark:text-stone-300',
    subtitle: 'text-stone-600 dark:text-stone-400',
  },
  alunos: {
    card: 'bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-zinc-200 dark:border-zinc-700',
    icon: 'bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300',
    value: 'text-zinc-900 dark:text-zinc-100',
    title: 'text-zinc-700 dark:text-zinc-300',
    subtitle: 'text-zinc-600 dark:text-zinc-400',
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
  compact = false
}: StatCardProps) => {
  const isClickable = onClick || href;
  const styles = cardVariants[variant];

  const content = (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 group h-full',
      isClickable ? 'hover:shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : 'hover:shadow-lg',
      styles.card,
      'border shadow-md'
    )}>
      {/* Efeito sutil de brilho */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300" />

      <CardContent className={cn("relative", compact ? "p-4" : "p-6")}>
        <div className={cn("flex items-start justify-between", compact ? "mb-3" : "mb-5")}>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "font-medium tracking-wide uppercase",
                compact ? "text-xs" : "text-sm",
                styles.title
              )}>
                {title}
              </h3>
              {isClickable && (
                <ArrowUpRight className={cn(
                  "transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                  compact ? "w-3 h-3" : "w-3 h-3",
                  styles.title
                )} />
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "font-bold tracking-tight",
                compact ? "text-3xl" : "text-4xl",
                styles.value
              )}>
                {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
              </span>
              {subtitle && (
                <span className={cn(
                  "font-medium",
                  compact ? "text-xs" : "text-sm",
                  styles.subtitle
                )}>
                  {subtitle}
                </span>
              )}
            </div>
            {trend && (
              <div className="flex items-center gap-1.5">
                {trend.isPositive ? (
                  <TrendingUp className={cn("text-emerald-600 dark:text-emerald-400", compact ? "w-3 h-3" : "w-4 h-4")} />
                ) : (
                  <TrendingDown className={cn("text-red-600 dark:text-red-400", compact ? "w-3 h-3" : "w-4 h-4")} />
                )}
                <span className={cn(
                  "font-semibold",
                  compact ? "text-[10px]" : "text-xs",
                  trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}% {trend.period || 'vs mês anterior'}
                </span>
              </div>
            )}
          </div>

          {/* Ícone com gradiente sutil */}
          <div className={cn(
            'relative rounded-xl flex items-center justify-center flex-shrink-0 shadow-md',
            compact ? 'w-11 h-11' : 'w-14 h-14',
            styles.icon
          )}>
            <Icon className={cn("relative z-10", compact ? "w-5 h-5" : "w-7 h-7")} />
          </div>
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
