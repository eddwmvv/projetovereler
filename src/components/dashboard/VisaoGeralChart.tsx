import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartData {
  name: string;
  value: number;
  color: string;
  meta?: number;
}

interface VisaoGeralChartProps {
  data: ChartData[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  showMeta?: boolean;
}

export function VisaoGeralChart({
  data,
  title = "Visão Geral do Sistema",
  xLabel = "Entidades",
  yLabel = "Quantidade",
  height = 300,
  showMeta = false
}: VisaoGeralChartProps) {
  // Custom tooltip with enhanced styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{data.name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-900 dark:text-slate-100">{data.value}</span> {yLabel}
          </p>
          {data.meta && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Meta: {data.meta}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom bar with gradient effect
  const CustomBar = (props: any) => {
    const { x, y, width, height, fill } = props;
    return (
      <g>
        <defs>
          <linearGradient id={`gradient-${props.payload.name}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity="0.9" />
            <stop offset="100%" stopColor={fill} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={`url(#gradient-${props.payload.name})`}
          rx={4}
          className="transition-all duration-300 hover:opacity-80"
        />
      </g>
    );
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              label={{ value: xLabel, position: 'insideBottom', offset: -5, style: { fill: '#94a3b8', fontSize: 11 } }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 11 } }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="circle"
            />
            <Bar
              dataKey="value"
              shape={<CustomBar />}
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            {showMeta && (
              <Bar
                dataKey="meta"
                fill="rgba(148, 163, 184, 0.3)"
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="5,5"
                name="Meta"
                animationDuration={1000}
                animationEasing="ease-out"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
