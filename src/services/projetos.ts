import { supabase } from '@/integrations/supabase/client';
import { Projeto } from '@/types';
import type { Database } from '@/integrations/supabase/types';

type ProjetoRow = Database['public']['Tables']['projetos']['Row'];

type CreateProjetoInput = {
  nome: string;
  descricao?: string;
  empresaId: string;
  status?: 'ativo' | 'inativo' | 'finalizado';
  anoAcao: string;
  municipiosIds?: string[];
};

type UpdateProjetoInput = {
  nome?: string;
  descricao?: string;
  empresaId?: string;
  status?: 'ativo' | 'inativo' | 'finalizado';
  anoAcao?: string;
  municipiosIds?: string[];
};

export const projetosService = {
  async getAll(): Promise<Projeto[]> {
    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const projetos = (data || []);
    if (projetos.length === 0) return [];

    // Buscar todos os relacionamentos de uma vez usando IN
    const projetosIds = projetos.map(p => p.id);
    const { data: relacionamentos, error: relacionamentosError } = await supabase
      .from('municipio_projetos')
      .select('projeto_id, municipio_id')
      .in('projeto_id', projetosIds);

    if (relacionamentosError) {
      console.error('Erro ao buscar relacionamentos:', relacionamentosError);
      // Retornar projetos sem relacionamentos em caso de erro
      return projetos.map(transformProjeto).map(p => ({ ...p, municipiosIds: [] }));
    }

    // Agrupar relacionamentos por projeto
    const relacionamentosPorProjeto = new Map<string, string[]>();
    relacionamentos?.forEach(rel => {
      const ids = relacionamentosPorProjeto.get(rel.projeto_id) || [];
      ids.push(rel.municipio_id);
      relacionamentosPorProjeto.set(rel.projeto_id, ids);
    });

    return projetos.map(projeto => ({
      ...transformProjeto(projeto),
      municipiosIds: relacionamentosPorProjeto.get(projeto.id) || [],
    }));
  },

  async getById(id: string): Promise<Projeto | null> {
    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Buscar relacionamentos com municípios
    const { data: relacionamentos, error: relacionamentosError } = await supabase
      .from('municipio_projetos')
      .select('municipio_id')
      .eq('projeto_id', id);

    if (relacionamentosError) {
      console.error('Erro ao buscar relacionamentos:', relacionamentosError);
      // Retornar projeto sem relacionamentos em caso de erro
      return {
        ...transformProjeto(data),
        municipiosIds: [],
      };
    }

    return {
      ...transformProjeto(data),
      municipiosIds: relacionamentos?.map(r => r.municipio_id) || [],
    };
  },

  async getByEmpresaId(empresaId: string): Promise<Projeto[]> {
    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const projetos = (data || []);
    if (projetos.length === 0) return [];

    // Buscar todos os relacionamentos de uma vez usando IN
    const projetosIds = projetos.map(p => p.id);
    const { data: relacionamentos, error: relacionamentosError } = await supabase
      .from('municipio_projetos')
      .select('projeto_id, municipio_id')
      .in('projeto_id', projetosIds);

    if (relacionamentosError) {
      console.error('Erro ao buscar relacionamentos:', relacionamentosError);
      // Retornar projetos sem relacionamentos em caso de erro
      return projetos.map(transformProjeto).map(p => ({ ...p, municipiosIds: [] }));
    }

    // Agrupar relacionamentos por projeto
    const relacionamentosPorProjeto = new Map<string, string[]>();
    relacionamentos?.forEach(rel => {
      const ids = relacionamentosPorProjeto.get(rel.projeto_id) || [];
      ids.push(rel.municipio_id);
      relacionamentosPorProjeto.set(rel.projeto_id, ids);
    });

    return projetos.map(projeto => ({
      ...transformProjeto(projeto),
      municipiosIds: relacionamentosPorProjeto.get(projeto.id) || [],
    }));
  },

  async create(input: CreateProjetoInput): Promise<Projeto> {
    const { data, error } = await supabase
      .from('projetos')
      .insert({
        nome: input.nome,
        descricao: input.descricao || null,
        empresa_id: input.empresaId,
        status: input.status || 'ativo',
        ano_acao: input.anoAcao,
      })
      .select()
      .single();

    if (error) throw error;

    // Criar relacionamentos com municípios se fornecidos
    if (input.municipiosIds && input.municipiosIds.length > 0) {
      const { error: relacionamentoError } = await supabase
        .from('municipio_projetos')
        .insert(
          input.municipiosIds.map(municipioId => ({
            projeto_id: data.id,
            municipio_id: municipioId,
          }))
        );

      if (relacionamentoError) {
        // Se falhar ao criar relacionamentos, tentar remover o projeto criado
        await supabase.from('projetos').delete().eq('id', data.id);
        throw new Error(`Erro ao vincular municípios ao projeto: ${relacionamentoError.message}`);
      }
    }

    return {
      ...transformProjeto(data),
      municipiosIds: input.municipiosIds || [],
    };
  },

  async update(id: string, input: UpdateProjetoInput): Promise<Projeto> {
    const updateData: any = {};

    if (input.nome !== undefined) updateData.nome = input.nome;
    if (input.descricao !== undefined) updateData.descricao = input.descricao || null;
    if (input.empresaId !== undefined) updateData.empresa_id = input.empresaId;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.anoAcao !== undefined) updateData.ano_acao = input.anoAcao;

    const { data, error } = await supabase
      .from('projetos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Atualizar relacionamentos com municípios se fornecidos
    if (input.municipiosIds !== undefined) {
      // Remover relacionamentos existentes
      await supabase
        .from('municipio_projetos')
        .delete()
        .eq('projeto_id', id);

      // Criar novos relacionamentos se houver municípios
      if (input.municipiosIds.length > 0) {
        const { error: relacionamentoError } = await supabase
          .from('municipio_projetos')
          .insert(
            input.municipiosIds.map(municipioId => ({
              projeto_id: id,
              municipio_id: municipioId,
            }))
          );

        if (relacionamentoError) {
          throw new Error(`Erro ao vincular municípios ao projeto: ${relacionamentoError.message}`);
        }
      }
    }

    // Buscar relacionamentos atualizados
    const { data: relacionamentos } = await supabase
      .from('municipio_projetos')
      .select('municipio_id')
      .eq('projeto_id', id);

    return {
      ...transformProjeto(data),
      municipiosIds: relacionamentos?.map(r => r.municipio_id) || [],
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projetos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

function transformProjeto(row: ProjetoRow): Omit<Projeto, 'municipiosIds'> {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao || '',
    empresaId: row.empresa_id,
    status: row.status as 'ativo' | 'inativo' | 'finalizado',
    anoAcao: row.ano_acao,
    createdAt: new Date(row.created_at),
  };
}
