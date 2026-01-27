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
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <GraduationCap className="w-4 h-4 md:w-5 md:h-5" />
          Performance por {tipo === 'escola' ? 'Escola' : 'Município'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-6 pt-0">
        <div className="space-y-2">
          {dadosHeatmap.slice(0, 10).map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 p-3 rounded-lg border hover:shadow-md transition-all bg-card"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {item.entregues} de {item.total} alunos ({item.taxaConclusao.toFixed(1)}%)
                  {item.total > 0 && item.entregues === 0 && item.progressoMedio > 0 && (
                    <span className="block md:inline md:ml-2 text-blue-600">
                      • Progresso médio: {item.progressoMedio.toFixed(0)}%
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 md:flex-none md:w-24 h-5 md:h-6 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      'h-full transition-all',
                      getIntensidadeCor(item.taxaConclusao, item.progressoMedio)
                    )}
                    style={{ width: `${Math.min(item.taxaConclusao || item.progressoMedio, 100)}%` }}
                  />
                </div>
                <span className={cn('text-sm font-bold w-10 md:w-12 text-right', getIntensidadeTexto(item.taxaConclusao))}>
                  {item.taxaConclusao > 0 ? item.taxaConclusao.toFixed(0) : item.progressoMedio.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
          {dadosHeatmap.length === 0 && (
            <div className="text-center py-6 md:py-8 text-muted-foreground">
              <p className="text-sm">Nenhum dado disponível</p>
            </div>
          )}
        </div>
        {/* Legenda - Mobile: Scroll horizontal */}
        <div className="mt-3 md:mt-4 -mx-3 md:mx-0 px-3 md:px-0 overflow-x-auto">
          <div className="flex items-center gap-3 md:gap-4 text-xs text-muted-foreground min-w-max">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-500 rounded" />
              <span>80-100%</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-400 rounded" />
              <span>Progresso</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-gray-400 rounded" />
              <span>Sem alunos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
