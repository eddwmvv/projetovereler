import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { turmasService } from '@/services/turmas';
import { Turma } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useTurmas() {
  return useQuery<Turma[]>({
    queryKey: ['turmas'],
    queryFn: () => turmasService.getAll(),
  });
}

export function useTurma(id: string) {
  return useQuery<Turma | null>({
    queryKey: ['turmas', id],
    queryFn: () => turmasService.getById(id),
    enabled: !!id,
  });
}

export function useTurmasByEscola(escolaId: string) {
  return useQuery<Turma[]>({
    queryKey: ['turmas', 'escola', escolaId],
    queryFn: () => turmasService.getByEscolaId(escolaId),
    enabled: !!escolaId,
  });
}

export function useCreateTurma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: turmasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Turma criada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar turma.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTurma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof turmasService.update>[1] }) =>
      turmasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Turma atualizada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar turma.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteTurma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: turmasService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Turma excluída com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir turma.',
        variant: 'destructive',
      });
    },
  });
}