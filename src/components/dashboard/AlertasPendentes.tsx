import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertTriangle, Clock, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AlertType = 'warning' | 'error' | 'info' | 'success';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: Date;
  actionLabel?: string;
  onAction?: () => void;
  dismissible?: boolean;
}

interface AlertasPendentesProps {
  alerts: Alert[];
  title?: string;
  maxItems?: number;
  onDismiss?: (alertId: string) => void;
}

const alertIcons: Record<AlertType, any> = {
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  success: CheckCircle,
};

const alertColors: Record<AlertType, {
  bg: string;
  border: string;
  icon: string;
  text: string;
}> = {
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'bg-amber-500',
    text: 'text-amber-900 dark:text-amber-100',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
    icon: 'bg-red-500',
    text: 'text-red-900 dark:text-red-100',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'bg-blue-500',
    text: 'text-blue-900 dark:text-blue-100',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'bg-emerald-500',
    text: 'text-emerald-900 dark:text-emerald-100',
  },
};

export function AlertasPendentes({
  alerts,
  title = "Alertas e Notificações",
  maxItems = 5,
  onDismiss
}: AlertasPendentesProps) {
  const displayAlerts = alerts.slice(0, maxItems);
  const hasAlerts = displayAlerts.length > 0;

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          {title}
          {hasAlerts && (
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
              {alerts.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAlerts ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum alerta pendente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayAlerts.map((alert) => {
              const Icon = alertIcons[alert.type];
              const colors = alertColors[alert.type];

              return (
                <div
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-200",
                    colors.bg,
                    colors.border
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                      colors.icon
                    )}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={cn("font-medium text-sm", colors.text)}>
                          {alert.title}
                        </h4>
                        {alert.dismissible && onDismiss && (
                          <button
                            onClick={() => onDismiss(alert.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            {alert.timestamp.toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {alert.actionLabel && alert.onAction && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={alert.onAction}
                            className="h-7 text-xs"
                          >
                            {alert.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
