import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { armacoesService, processarImportacaoArmacoes } from '@/services/armacoes';
import { Armação, ArmaçãoHistorico, ArmaçãoTipo, Tamanho } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useArmacoes() {
  return useQuery<Armação[]>({
    queryKey: ['armacoes'],
    queryFn: () => armacoesService.getAll(),
  });
}

export function useArmacoesDisponiveis() {
  return useQuery<Armação[]>({
    queryKey: ['armacoes', 'disponiveis'],
    queryFn: () => armacoesService.getDisponiveis(),
  });
}

export function useArmação(id: string) {
  return useQuery<Armação | null>({
    queryKey: ['armacoes', id],
    queryFn: () => armacoesService.getById(id),
    enabled: !!id,
  });
}

export function useArmaçãoByNumeracao(numeracao: string) {
  return useQuery<Armação | null>({
    queryKey: ['armacoes', 'numeracao', numeracao],
    queryFn: () => armacoesService.getByNumeracao(numeracao),
    enabled: !!numeracao,
  });
}

export function useCreateArmação() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { tipo: ArmaçãoTipo; tamanhoId?: string; numeracao?: string }) =>
      armacoesService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armacoes'] });
      toast({
        title: 'Sucesso!',
        description: 'Armação cadastrada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao cadastrar armação.',
        variant: 'destructive',
      });
    },
  });
}

export function useMarcarArmaçãoUtilizada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      armacaoId,
      alunoId,
      observacoes,
    }: {
      armacaoId: string;
      alunoId: string;
      observacoes?: string;
    }) => armacoesService.marcarComoUtilizada(armacaoId, alunoId, observacoes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armacoes'] });
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['armacoes-historico'] });
      queryClient.invalidateQueries({ queryKey: ['current-armacao'] });
      toast({
        title: 'Sucesso!',
        description: 'Armação vinculada ao aluno com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao vincular armação.',
        variant: 'destructive',
      });
    },
  });
}

export function useLiberarArmacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => armacoesService.liberarArmacao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armacoes'] });
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['current-armacao'] });
      toast({
        title: 'Sucesso!',
        description: 'Armação liberada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao liberar armação.',
        variant: 'destructive',
      });
    },
  });
}

export function useReleaseCurrentArmacaoForAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alunoId: string) => armacoesService.releaseCurrentArmacaoForAluno(alunoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armacoes'] });
      queryClient.invalidateQueries({ queryKey: ['armacoes', 'disponiveis'] });
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['armacoes-historico'] });
      queryClient.invalidateQueries({ queryKey: ['current-armacao'] });
      toast({
        title: 'Sucesso!',
        description: 'Armação liberada devido à mudança de fase.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao liberar armação.',
        variant: 'destructive',
      });
    },
  });
}

export function useCurrentArmacaoForAluno(alunoId: string) {
  return useQuery<Armação | null>({
    queryKey: ['current-armacao', alunoId],
    queryFn: () => armacoesService.getCurrentArmacaoForAluno(alunoId),
    enabled: !!alunoId,
  });
}

export function useArmaçãoHistorico(alunoId?: string, armacaoId?: string) {
  return useQuery<ArmaçãoHistorico[]>({
    queryKey: ['armacoes-historico', alunoId, armacaoId],
    queryFn: () => armacoesService.getHistorico(alunoId, armacaoId),
    enabled: !!alunoId || !!armacaoId,
  });
}

// ===== HOOKS PARA TAMANHOS =====
export function useTamanhos() {
  return useQuery<Tamanho[]>({
    queryKey: ['tamanhos'],
    queryFn: () => armacoesService.getTamanhos(),
  });
}

export function useTamanho(id: string) {
  return useQuery<Tamanho | null>({
    queryKey: ['tamanhos', id],
    queryFn: () => armacoesService.getTamanhoById(id),
    enabled: !!id,
  });
}

export function useTamanhoByNome(nome: string) {
  return useQuery<Tamanho | null>({
    queryKey: ['tamanhos', 'nome', nome],
    queryFn: () => armacoesService.getTamanhoByNome(nome),
    enabled: !!nome,
  });
}

export function useCreateTamanho() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { nome: string; descricao?: string }) =>
      armacoesService.createTamanho(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tamanhos'] });
      toast({
        title: 'Sucesso!',
        description: 'Tamanho criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar tamanho.',
        variant: 'destructive',
      });
    },
  });
}

export function useImportArmacoesEmMassa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: processarImportacaoArmacoes,
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['armacoes'] });
      queryClient.invalidateQueries({ queryKey: ['tamanhos'] });

      const successCount = results.filter(r => r.success).length;
      const duplicateCount = results.filter(r => r.isDuplicate).length;
      const errorCount = results.filter(r => !r.success && !r.isDuplicate).length;

      toast({
        title: 'Importação concluída!',
        description: `${successCount} importadas, ${duplicateCount} duplicadas, ${errorCount} com erro.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro na importação',
        description: error.message || 'Erro ao importar armações.',
        variant: 'destructive',
      });
    },
  });
}
