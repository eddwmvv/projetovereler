import { useMemo } from 'react';
import { useAlunos } from '@/hooks/use-alunos';
import { useEscolas } from '@/hooks/use-escolas';
import { useMunicipios } from '@/hooks/use-municipios';
import { cn } from '@/lib/utils';

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
    if (taxa > 0) {
      if (taxa >= 80) return 'bg-emerald-500';
      if (taxa >= 60) return 'bg-emerald-400';
      if (taxa >= 40) return 'bg-yellow-400';
      if (taxa >= 20) return 'bg-orange-400';
      return 'bg-red-400';
    }

    if (progressoMedio > 0) {
      if (progressoMedio >= 75) return 'bg-blue-400';
      if (progressoMedio >= 50) return 'bg-cyan-400';
      if (progressoMedio >= 25) return 'bg-indigo-400';
      return 'bg-purple-400';
    }

    return 'bg-gray-400';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Performance por {tipo === 'escola' ? 'Escola' : 'Município'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Taxa de conclusão dos alunos</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 11-4 0 2 2 0 014 0zM10 12a2 2 0 11-4 0 2 2 0 014 0zM10 18a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {dadosHeatmap.slice(0, 10).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.nome}</p>
              <p className="text-xs text-gray-500 mt-1">
                {item.entregues} de {item.total} alunos
              </p>
            </div>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all rounded-full',
                    getIntensidadeCor(item.taxaConclusao, item.progressoMedio)
                  )}
                  style={{ width: `${Math.min(item.taxaConclusao || item.progressoMedio, 100)}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900 w-10 text-right">
                {item.taxaConclusao > 0 ? item.taxaConclusao.toFixed(0) : item.progressoMedio.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
        {dadosHeatmap.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500">
            Nenhum dado disponível
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-600 mb-3">Legenda de Cores</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-gray-600">80-100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            <span className="text-xs text-gray-600">60-80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-xs text-gray-600">40-60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-xs text-gray-600">Em progresso</span>
          </div>
        </div>
      </div>
    </div>
  );
}
