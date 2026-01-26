import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { municipiosService } from '@/services/municipios';
import { Municipio } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useMunicipios() {
  return useQuery<Municipio[]>({
    queryKey: ['municipios'],
    queryFn: () => municipiosService.getAll(),
  });
}

export function useMunicipio(id: string) {
  return useQuery<Municipio | null>({
    queryKey: ['municipios', id],
    queryFn: () => municipiosService.getById(id),
    enabled: !!id,
  });
}

export function useCreateMunicipio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: municipiosService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['municipios'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Município criado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar município.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateMunicipio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof municipiosService.update>[1] }) =>
      municipiosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['municipios'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Município atualizado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar município.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteMunicipio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: municipiosService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['municipios'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso!',
        description: 'Município excluído com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir município.',
        variant: 'destructive',
      });
    },
  });
}
