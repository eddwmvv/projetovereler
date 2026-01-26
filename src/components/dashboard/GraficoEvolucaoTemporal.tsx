import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAlunos } from '@/hooks/use-alunos';
import { format, subMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StudentPhase } from '@/types';

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

export function GraficoEvolucaoTemporal() {
  const { data: alunos = [] } = useAlunos();

  const dadosEvolucao = useMemo(() => {
    // Gerar últimos 6 meses
    const meses = Array.from({ length: 6 }, (_, i) => {
      const data = subMonths(new Date(), 5 - i);
      return {
        mes: format(startOfMonth(data), 'MMM/yyyy', { locale: ptBR }),
        mesCompleto: startOfMonth(data),
      };
    });

    // Agrupar alunos por mês de criação e fase atual
    const dadosPorMes = meses.map(({ mes, mesCompleto }) => {
      const alunosDoMes = alunos.filter((aluno) => {
        const dataCriacao = new Date(aluno.createdAt);
        return (
          dataCriacao >= mesCompleto &&
          dataCriacao < new Date(mesCompleto.getFullYear(), mesCompleto.getMonth() + 1, 1)
        );
      });

      const porFase = alunosDoMes.reduce(
        (acc, aluno) => {
          acc[aluno.faseAtual] = (acc[aluno.faseAtual] || 0) + 1;
          return acc;
        },
        { triagem: 0, consulta: 0, producao_de_oculos: 0, entregue: 0 } as Record<StudentPhase, number>
      );

      return {
        mes,
        ...porFase,
        total: alunosDoMes.length,
      };
    });

    return dadosPorMes;
  }, [alunos]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Temporal de Alunos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosEvolucao}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.entries(faseLabels).map(([fase, label]) => (
              <Line
                key={fase}
                type="monotone"
                dataKey={fase}
                stroke={cores[fase as StudentPhase]}
                strokeWidth={2}
                name={label}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Mostrando evolução dos últimos 6 meses baseado na data de cadastro dos alunos</p>
        </div>
      </CardContent>
    </Card>
  );
}
