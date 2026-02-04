import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, Plus, Edit, CheckCircle, AlertCircle, FileText, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ActivityType = 'create' | 'update' | 'complete' | 'alert' | 'import' | 'delivery';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  user?: string;
  timestamp: Date;
  entity?: string;
}

interface TimelineAtividadesProps {
  activities: Activity[];
  title?: string;
  maxItems?: number;
}

const activityIcons: Record<ActivityType, any> = {
  create: Plus,
  update: Edit,
  complete: CheckCircle,
  alert: AlertCircle,
  import: FileText,
  delivery: Package,
};

const activityColors: Record<ActivityType, string> = {
  create: 'bg-blue-500',
  update: 'bg-amber-500',
  complete: 'bg-emerald-500',
  alert: 'bg-red-500',
  import: 'bg-purple-500',
  delivery: 'bg-cyan-500',
};

const activityBgColors: Record<ActivityType, string> = {
  create: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  update: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
  complete: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
  alert: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
  import: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
  delivery: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800',
};

export function TimelineAtividades({
  activities,
  title = "Atividades Recentes",
  maxItems = 5
}: TimelineAtividadesProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity, index) => {
              const Icon = activityIcons[activity.type];
              const bgColor = activityBgColors[activity.type];
              const iconColor = activityColors[activity.type];

              return (
                <div
                  key={activity.id}
                  className={cn(
                    "relative pl-6 pb-4",
                    index !== displayActivities.length - 1 && "border-l-2 border-slate-200 dark:border-slate-700"
                  )}
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800",
                      iconColor
                    )}
                  />

                  {/* Activity content */}
                  <div
                    className={cn(
                      "p-3 rounded-lg border transition-all duration-200",
                      bgColor
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                        iconColor
                      )}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                            {activity.title}
                          </h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatDistanceToNow(activity.timestamp, {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {activity.description}
                        </p>
                        {activity.user && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <User className="w-3 h-3" />
                            <span>{activity.user}</span>
                          </div>
                        )}
                        {activity.entity && (
                          <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-white/50 dark:bg-black/20 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {activity.entity}
                          </div>
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
