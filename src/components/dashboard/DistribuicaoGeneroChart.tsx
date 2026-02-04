import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface GenderData {
  name: string;
  value: number;
  color: string;
  icon?: string;
}

interface DistribuicaoGeneroChartProps {
  data: GenderData[];
  title?: string;
  height?: number;
  showLegend?: boolean;
}

// More contrasting and accessible colors
const defaultColors = {
  masculino: '#3B82F6', // Blue-500
  feminino: '#EC4899', // Pink-500
  outro: '#8B5CF6', // Violet-500
};

export function DistribuicaoGeneroChart({
  data,
  title = "Distribuição por Gênero",
  height = 300,
  showLegend = true
}: DistribuicaoGeneroChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip with enhanced styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <p className="font-semibold text-slate-900 dark:text-slate-100">{data.name}</p>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-900 dark:text-slate-100">{data.value}</span> alunos
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            {percentage}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label for the pie chart
  const renderLabel = (entry: any) => {
    const percentage = ((entry.value / total) * 100).toFixed(0);
    return `${percentage}%`;
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={80}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value: string, entry: any) => (
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {value} ({entry.payload.value})
                  </span>
                )}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Summary section */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Total de Alunos</span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
