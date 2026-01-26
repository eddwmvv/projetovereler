import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projetosService } from '@/services/projetos';
import { Projeto } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useProjetos() {
  return useQuery<Projeto[]>({
    queryKey: ['projetos'],
    queryFn: () => projetosService.getAll(),
  });
}

export function useProjeto(id: string) {
  return useQuery<Projeto | null>({
    queryKey: ['projetos', id],
    queryFn: () => projetosService.getById(id),
    enabled: !!id,
  });
}

export function useProjetosByEmpresa(empresaId: string) {
  return useQuery<Projeto[]>({
    queryKey: ['projetos', 'empresa', empresaId],
    queryFn: () => projetosService.getByEmpresaId(empresaId),
    enabled: !!empresaId,
  });
}

export function useCreateProjeto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projetosService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Projeto criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar projeto.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateProjeto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof projetosService.update>[1] }) =>
      projetosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Projeto atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar projeto.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteProjeto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projetosService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Projeto excluído com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir projeto.',
        variant: 'destructive',
      });
    },
  });
}