import { useQuery } from '@tanstack/react-query';
import {
  relatoriosService,
} from '@/services/relatorios';
import {
  RelatorioFiltros,
  RelatorioGeral,
  RelatorioEscola,
  RelatorioMunicipio,
  RelatorioEmpresa,
  AlunoRelatorio,
} from '@/types';

export function useRelatorioGeral(filtros?: RelatorioFiltros) {
  return useQuery<RelatorioGeral>({
    queryKey: ['relatorio', 'geral', filtros],
    queryFn: () => relatoriosService.getRelatorioGeral(filtros),
  });
}

export function useRelatorioEscola(escolaId: string, filtros?: RelatorioFiltros) {
  return useQuery<RelatorioEscola>({
    queryKey: ['relatorio', 'escola', escolaId, filtros],
    queryFn: () => relatoriosService.getRelatorioEscola(escolaId, filtros),
    enabled: !!escolaId,
  });
}

export function useRelatorioMunicipio(municipioId: string, filtros?: RelatorioFiltros) {
  return useQuery<RelatorioMunicipio>({
    queryKey: ['relatorio', 'municipio', municipioId, filtros],
    queryFn: () => relatoriosService.getRelatorioMunicipio(municipioId, filtros),
    enabled: !!municipioId,
  });
}

export function useRelatorioEmpresa(empresaId: string, filtros?: RelatorioFiltros) {
  return useQuery<RelatorioEmpresa>({
    queryKey: ['relatorio', 'empresa', empresaId, filtros],
    queryFn: () => relatoriosService.getRelatorioEmpresa(empresaId, filtros),
    enabled: !!empresaId,
  });
}

export function useAlunosParaExportacao(filtros?: RelatorioFiltros) {
  return useQuery<AlunoRelatorio[]>({
    queryKey: ['relatorio', 'alunos-exportacao', filtros],
    queryFn: () => relatoriosService.getAlunosParaExportacao(filtros),
  });
}
