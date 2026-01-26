import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAlunos } from '@/hooks/use-alunos';
import { useEscolas } from '@/hooks/use-escolas';
import { useMunicipios } from '@/hooks/use-municipios';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';

interface HeatmapPerformanceProps {
  tipo: 'escola' | 'municipio';
}

export function HeatmapPerformance({ tipo }: HeatmapPerformanceProps) {
  const { data: alunos = [] } = useAlunos();
  const { data: escolas = [] } = useEscolas();
  const { data: municipios = [] } = useMunicipios();

  const dadosHeatmap = useMemo(() => {
    if (tipo === 'escola') {
      return escolas.map((escola) => {
        const alunosDaEscola = alunos.filter((a) => a.escolaId === escola.id);
        const total = alunosDaEscola.length;
        const entregues = alunosDaEscola.filter((a) => a.faseAtual === 'entregue').length;
        const taxaConclusao = total > 0 ? (entregues / total) * 100 : 0;

        // Calcular progresso médio dos alunos não entregues
        const alunosNaoEntregues = alunosDaEscola.filter((a) => a.faseAtual !== 'entregue');
        const progressoMedio = alunosNaoEntregues.length > 0
          ? alunosNaoEntregues.reduce((acc, aluno) => {
              const fases = ['triagem', 'consulta', 'producao_de_oculos', 'entregue'];
              const faseIndex = fases.indexOf(aluno.faseAtual);
              return acc + (faseIndex + 1) / fases.length * 100;
            }, 0) / alunosNaoEntregues.length
          : 0;

        return {
          id: escola.id,
          nome: escola.nome,
          total,
          entregues,
          taxaConclusao,
          progressoMedio,
        };
      }).sort((a, b) => b.taxaConclusao - a.taxaConclusao);
    } else {
      return municipios.map((municipio) => {
        const alunosDoMunicipio = alunos.filter((a) => a.municipioId === municipio.id);
        const total = alunosDoMunicipio.length;
        const entregues = alunosDoMunicipio.filter((a) => a.faseAtual === 'entregue').length;
        const taxaConclusao = total > 0 ? (entregues / total) * 100 : 0;

        // Calcular progresso médio dos alunos não entregues
        const alunosNaoEntregues = alunosDoMunicipio.filter((a) => a.faseAtual !== 'entregue');
        const progressoMedio = alunosNaoEntregues.length > 0
          ? alunosNaoEntregues.reduce((acc, aluno) => {
              const fases = ['triagem', 'consulta', 'producao_de_oculos', 'entregue'];
              const faseIndex = fases.indexOf(aluno.faseAtual);
              return acc + (faseIndex + 1) / fases.length * 100;
            }, 0) / alunosNaoEntregues.length
          : 0;

        return {
          id: municipio.id,
          nome: municipio.nome,
          total,
          entregues,
          taxaConclusao,
          progressoMedio,
        };
      }).sort((a, b) => b.taxaConclusao - a.taxaConclusao);
    }
  }, [alunos, escolas, municipios, tipo]);

  const getIntensidadeCor = (taxa: number, progressoMedio: number = 0) => {
    // Se há taxa de conclusão, usar ela
    if (taxa > 0) {
      if (taxa >= 80) return 'bg-emerald-500 hover:bg-emerald-600';
      if (taxa >= 60) return 'bg-emerald-400 hover:bg-emerald-500';
      if (taxa >= 40) return 'bg-yellow-400 hover:bg-yellow-500';
      if (taxa >= 20) return 'bg-orange-400 hover:bg-orange-500';
      return 'bg-red-400 hover:bg-red-500';
    }

    // Se não há conclusão mas há progresso médio, usar cores baseadas no progresso
    if (progressoMedio > 0) {
      if (progressoMedio >= 75) return 'bg-blue-400 hover:bg-blue-500';
      if (progressoMedio >= 50) return 'bg-cyan-400 hover:bg-cyan-500';
      if (progressoMedio >= 25) return 'bg-indigo-400 hover:bg-indigo-500';
      return 'bg-purple-400 hover:bg-purple-500';
    }

    // Sem progresso
    return 'bg-gray-400 hover:bg-gray-500';
  };

  const getIntensidadeTexto = (taxa: number) => {
    if (taxa >= 80) return 'text-emerald-900';
    if (taxa >= 60) return 'text-emerald-800';
    if (taxa >= 40) return 'text-yellow-900';
    if (taxa >= 20) return 'text-orange-900';
    return 'text-red-900';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Performance por {tipo === 'escola' ? 'Escola' : 'Município'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {dadosHeatmap.slice(0, 10).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-md transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {item.entregues} de {item.total} alunos ({item.taxaConclusao.toFixed(1)}%)
                  {item.total > 0 && item.entregues === 0 && item.progressoMedio > 0 && (
                    <span className="ml-2 text-blue-600">
                      • Progresso médio: {item.progressoMedio.toFixed(0)}%
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-6 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      'h-full transition-all',
                      getIntensidadeCor(item.taxaConclusao, item.progressoMedio)
                    )}
                    style={{ width: `${Math.min(item.taxaConclusao || item.progressoMedio, 100)}%` }}
                  />
                </div>
                <span className={cn('text-sm font-bold w-12 text-right', getIntensidadeTexto(item.taxaConclusao))}>
                  {item.taxaConclusao > 0 ? item.taxaConclusao.toFixed(0) : item.progressoMedio.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
          {dadosHeatmap.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum dado disponível</p>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded" />
            <span>80-100% concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded" />
            <span>Em progresso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded" />
            <span>Sem alunos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
