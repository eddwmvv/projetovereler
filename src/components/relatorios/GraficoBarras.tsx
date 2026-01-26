import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface GraficoBarrasProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function GraficoBarras({ data, title, xLabel, yLabel, height = 300 }: GraficoBarrasProps) {
  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5 } : undefined}
            fontSize={12}
          />
          <YAxis
            label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined}
            fontSize={12}
          />
          <Tooltip
            formatter={(value, name) => [`${value} alunos`, 'Quantidade']}
            labelStyle={{ color: '#000' }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
