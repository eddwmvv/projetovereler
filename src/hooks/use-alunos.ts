import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alunosService } from '@/services/alunos';
import { Aluno } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useAlunos() {
  return useQuery<Aluno[]>({
    queryKey: ['alunos'],
    queryFn: () => alunosService.getAll(),
  });
}

export function useAluno(id: string) {
  return useQuery<Aluno | null>({
    queryKey: ['alunos', id],
    queryFn: () => alunosService.getById(id),
    enabled: !!id,
  });
}

export function useAlunosByTurma(turmaId: string) {
  return useQuery<Aluno[]>({
    queryKey: ['alunos', 'turma', turmaId],
    queryFn: () => alunosService.getByTurmaId(turmaId),
    enabled: !!turmaId,
  });
}

export function useCreateAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: alunosService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Aluno criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar aluno.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof alunosService.update>[1] }) =>
      alunosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Aluno atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar aluno.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteAluno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: alunosService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Aluno excluído com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir aluno.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateAlunosBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, faseAtual }: { ids: string[]; faseAtual: import('@/types').StudentPhase }) =>
      alunosService.updateBatch(ids, faseAtual),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: `${variables.ids.length} aluno(s) atualizado(s) com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar alunos.',
        variant: 'destructive',
      });
    },
  });
}

export function useImportarAlunos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      alunos,
      escolaId,
      municipioId,
      projetoId,
      empresaId
    }: {
      alunos: import('@/services/alunos').AlunoImportData[];
      escolaId: string;
      municipioId: string;
      projetoId: string;
      empresaId: string;
    }) => import('@/services/alunos').importarAlunosEmMassa(alunos, escolaId, municipioId, projetoId, empresaId),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      queryClient.invalidateQueries({ queryKey: ['escolas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}