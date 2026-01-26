import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { escolasService } from '@/services/escolas';
import { Escola } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useEscolas() {
  return useQuery<Escola[]>({
    queryKey: ['escolas'],
    queryFn: () => escolasService.getAll(),
  });
}

export function useEscola(id: string) {
  return useQuery<Escola | null>({
    queryKey: ['escolas', id],
    queryFn: () => escolasService.getById(id),
    enabled: !!id,
  });
}

export function useEscolasByMunicipio(municipioId: string) {
  return useQuery<Escola[]>({
    queryKey: ['escolas', 'municipio', municipioId],
    queryFn: () => escolasService.getByMunicipioId(municipioId),
    enabled: !!municipioId,
  });
}

export function useCreateEscola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: escolasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escolas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Escola criada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar escola.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateEscola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof escolasService.update>[1] }) =>
      escolasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escolas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Escola atualizada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar escola.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteEscola() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: escolasService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escolas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Escola excluída com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir escola.',
        variant: 'destructive',
      });
    },
  });
}