import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { StudentPhase } from '@/types';
import { useAlunos } from '@/hooks/use-alunos';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface GraficoInterativoProps {
  onFaseClick?: (fase: StudentPhase) => void;
  tipo?: 'pizza' | 'barras';
}

const faseLabels: Record<StudentPhase, string> = {
  triagem: 'Triagem',
  consulta: 'Consulta',
  producao_de_oculos: 'Produção de Óculos',
  entregue: 'Entregue',
};

const cores: Record<StudentPhase, string> = {
  triagem: '#0088FE',
  consulta: '#FFBB28',
  producao_de_oculos: '#00C49F',
  entregue: '#8884d8',
};

export function GraficoInterativo({ onFaseClick, tipo = 'pizza' }: GraficoInterativoProps) {
  const { data: alunos = [] } = useAlunos();
  const { toast } = useToast();
  const [faseSelecionada, setFaseSelecionada] = useState<StudentPhase | null>(null);

  // Calcular dados por fase
  const dadosPorFase = alunos.reduce(
    (acc, aluno) => {
      acc[aluno.faseAtual] = (acc[aluno.faseAtual] || 0) + 1;
      return acc;
    },
    {} as Record<StudentPhase, number>
  );

  const dadosGrafico = Object.entries(dadosPorFase).map(([fase, quantidade]) => ({
    name: faseLabels[fase as StudentPhase],
    value: quantidade,
    fase: fase as StudentPhase,
    color: cores[fase as StudentPhase],
  }));

  const handleClick = (data: any) => {
    if (data && data.fase) {
      setFaseSelecionada(data.fase);
      if (onFaseClick) {
        onFaseClick(data.fase);
        toast({
          title: 'Filtro aplicado',
          description: `Mostrando apenas alunos em ${faseLabels[data.fase]}`,
        });
      }
    }
  };

  const handleCellClick = (data: any, index: number) => {
    if (data && dadosGrafico[index]) {
      handleClick(dadosGrafico[index]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Distribuição por Fase</span>
          {faseSelecionada && (
            <button
              onClick={() => {
                setFaseSelecionada(null);
                toast({
                  title: 'Filtro removido',
                  description: 'Mostrando todos os alunos',
                });
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar filtro
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {tipo === 'pizza' ? (
            <PieChart>
              <Pie
                data={dadosGrafico}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onClick={handleCellClick}
                className="cursor-pointer"
              >
                {dadosGrafico.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className={cn(
                      'transition-all hover:opacity-80',
                      faseSelecionada === entry.fase && 'ring-2 ring-offset-2 ring-primary'
                    )}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={dadosGrafico}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                onClick={handleClick}
                className="cursor-pointer"
                fill="#8884d8"
              >
                {dadosGrafico.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className={cn(
                      'transition-all hover:opacity-80',
                      faseSelecionada === entry.fase && 'opacity-100 ring-2 ring-offset-2 ring-primary'
                    )}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
        {faseSelecionada && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">
              Filtro ativo: <span className="text-primary">{faseLabels[faseSelecionada]}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Clique em "Limpar filtro" para ver todos os alunos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
