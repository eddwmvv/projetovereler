import { useQuery } from '@tanstack/react-query';
import { historicoFasesService } from '@/services/historico-fases';
import { HistoricoFase } from '@/types';

// Hook para buscar histórico de mudanças de fase
// O histórico é criado automaticamente pelo trigger quando fase_atual é alterado
export function useHistoricoFases(alunoId: string) {
  return useQuery<HistoricoFase[]>({
    queryKey: ['historico-fases', alunoId],
    queryFn: () => historicoFasesService.getByAlunoId(alunoId),
    enabled: !!alunoId,
  });
}
