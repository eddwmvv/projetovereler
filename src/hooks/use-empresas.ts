import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empresasService } from '@/services/empresas';
import { Empresa } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useEmpresas() {
  return useQuery<Empresa[]>({
    queryKey: ['empresas'],
    queryFn: () => empresasService.getAll(),
  });
}

export function useEmpresa(id: string) {
  return useQuery<Empresa | null>({
    queryKey: ['empresas', id],
    queryFn: () => empresasService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: empresasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      toast({
        title: 'Sucesso!',
        description: 'Empresa criada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar empresa.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof empresasService.update>[1] }) =>
      empresasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Empresa atualizada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar empresa.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: empresasService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Empresa excluída com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir empresa.',
        variant: 'destructive',
      });
    },
  });
}