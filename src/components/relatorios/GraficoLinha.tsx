import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GraficoLinhaProps {
  data: { name: string; value: number }[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  color?: string;
}

export function GraficoLinha({ data, title, xLabel, yLabel, color = '#0088FE' }: GraficoLinhaProps) {
  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5 } : undefined} />
          <YAxis label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft' } : undefined} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
