import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Tipos para alunos inativos
export interface AlunoInativo {
  id: string;
  nomeCompleto: string;
  dataNascimento: Date;
  responsavelLegal: string;
  observacao?: string;
  turmaId: string;
  escolaId: string;
  municipioId: string;
  projetoId: string;
  empresaId: string;
  faseAtual: string;
  ativo: false;
  desligado_por: string;
  data_desligamento: Date;
  motivo_desligamento?: string;
  usuario_desligamento_nome: string;
  usuario_desligamento_email: string;
  createdAt: Date;
}

export function useAlunosInativos() {
  return useQuery({
    queryKey: ['alunos', 'inativos'],
    queryFn: async (): Promise<AlunoInativo[]> => {
      const { data, error } = await supabase
        .from('alunos_inativos')
        .select('*')
        .order('data_desligamento', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        nomeCompleto: row.nome_completo,
        dataNascimento: new Date(row.data_nascimento),
        responsavelLegal: row.responsavel_legal,
        observacao: row.observacao,
        turmaId: row.turma_id,
        escolaId: row.escola_id,
        municipioId: row.municipio_id,
        projetoId: row.projeto_id,
        empresaId: row.empresa_id,
        faseAtual: row.fase_atual,
        ativo: row.ativo,
        desligado_por: row.desligado_por,
        data_desligamento: new Date(row.data_desligamento),
        motivo_desligamento: row.motivo_desligamento,
        usuario_desligamento_nome: row.usuario_desligamento_nome,
        usuario_desligamento_email: row.usuario_desligamento_email,
        createdAt: new Date(row.created_at),
      }));
    },
  });
}

export function useReativarAluno() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (alunoId: string) => {
      const { error } = await supabase
        .rpc('reativar_aluno', { aluno_id: alunoId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos', 'inativos'] });
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Sucesso',
        description: 'Aluno reativado com sucesso! Retornou para a fase de triagem.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao reativar aluno',
        variant: 'destructive',
      });
    },
  });
}