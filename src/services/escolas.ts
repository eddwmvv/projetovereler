import { supabase } from '@/integrations/supabase/client';
import { Escola } from '@/types';
import type { Database } from '@/integrations/supabase/types';

type EscolaRow = Database['public']['Tables']['escolas']['Row'];

const escolasServiceBase = {
  async getAll(): Promise<Escola[]> {
    // Buscar todas as escolas
    const { data: escolas, error: escolasError } = await supabase
      .from('escolas')
      .select('*')
      .order('created_at', { ascending: false });

    if (escolasError) throw escolasError;

    if (!escolas || escolas.length === 0) {
      return [];
    }

    // Buscar todos os relacionamentos de projetos em uma única query
    const escolaIds = escolas.map(e => e.id);
    const { data: relacionamentos, error: relacionamentosError } = await supabase
      .from('escola_projetos')
      .select('escola_id, projeto_id')
      .in('escola_id', escolaIds);

    if (relacionamentosError) throw relacionamentosError;

    // Agrupar relacionamentos por escola_id
    const relacionamentosPorEscola = relacionamentos?.reduce((acc, rel) => {
      if (!acc[rel.escola_id]) {
        acc[rel.escola_id] = [];
      }
      acc[rel.escola_id].push(rel.projeto_id);
      return acc;
    }, {} as Record<string, string[]>) || {};

    return escolas.map((escola) => ({
      id: escola.id,
      nome: escola.nome,
      municipioId: escola.municipio_id,
      empresaId: escola.empresa_id,
      projetosIds: relacionamentosPorEscola[escola.id] || [],
      createdAt: new Date(escola.created_at),
    }));
  },

  async getById(id: string): Promise<Escola | null> {
    const { data, error } = await supabase
      .from('escolas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Buscar relacionamentos
    const { data: relacionamentos } = await supabase
      .from('escola_projetos')
      .select('projeto_id')
      .eq('escola_id', id);

    return {
      id: data.id,
      nome: data.nome,
      municipioId: data.municipio_id,
      empresaId: data.empresa_id,
      projetosIds: relacionamentos?.map(r => r.projeto_id) || [],
      createdAt: new Date(data.created_at),
    };
  },

  async getByMunicipioId(municipioId: string): Promise<Escola[]> {
    // Buscar todas as escolas do município
    const { data: escolas, error: escolasError } = await supabase
      .from('escolas')
      .select('*')
      .eq('municipio_id', municipioId)
      .order('created_at', { ascending: false });

    if (escolasError) throw escolasError;

    if (!escolas || escolas.length === 0) {
      return [];
    }

    // Buscar todos os relacionamentos de projetos para essas escolas em uma única query
    const escolaIds = escolas.map(e => e.id);
    const { data: relacionamentos, error: relacionamentosError } = await supabase
      .from('escola_projetos')
      .select('escola_id, projeto_id')
      .in('escola_id', escolaIds);

    if (relacionamentosError) throw relacionamentosError;

    // Agrupar relacionamentos por escola_id
    const relacionamentosPorEscola = relacionamentos?.reduce((acc, rel) => {
      if (!acc[rel.escola_id]) {
        acc[rel.escola_id] = [];
      }
      acc[rel.escola_id].push(rel.projeto_id);
      return acc;
    }, {} as Record<string, string[]>) || {};

    return escolas.map((escola) => ({
      id: escola.id,
      nome: escola.nome,
      municipioId: escola.municipio_id,
      empresaId: escola.empresa_id,
      projetosIds: relacionamentosPorEscola[escola.id] || [],
      createdAt: new Date(escola.created_at),
    }));
  },
};

type CreateEscolaInput = {
  nome: string;
  municipioId: string;
  empresaId: string;
  projetosIds?: string[];
};

type UpdateEscolaInput = {
  nome?: string;
  municipioId?: string;
  empresaId?: string;
  projetosIds?: string[];
};

export const escolasService = {
  ...escolasServiceBase,
  
  async create(input: CreateEscolaInput): Promise<Escola> {
    const { data, error } = await supabase
      .from('escolas')
      .insert({
        nome: input.nome,
        municipio_id: input.municipioId,
        empresa_id: input.empresaId,
      })
      .select()
      .single();

    if (error) throw error;

    // Criar relacionamentos com projetos se fornecidos
    if (input.projetosIds && input.projetosIds.length > 0) {
      const { error: relacionamentoError } = await supabase
        .from('escola_projetos')
        .insert(
          input.projetosIds.map(projetoId => ({
            escola_id: data.id,
            projeto_id: projetoId,
          }))
        );

      if (relacionamentoError) {
        // Se falhar ao criar relacionamentos, tentar remover a escola criada
        await supabase.from('escolas').delete().eq('id', data.id);
        throw new Error(`Erro ao vincular projetos à escola: ${relacionamentoError.message}`);
      }
    }

    return {
      id: data.id,
      nome: data.nome,
      municipioId: data.municipio_id,
      empresaId: data.empresa_id,
      projetosIds: input.projetosIds || [],
      createdAt: new Date(data.created_at),
    };
  },

  async update(id: string, input: UpdateEscolaInput): Promise<Escola> {
    const updateData: any = {};

    if (input.nome !== undefined) updateData.nome = input.nome;
    if (input.municipioId !== undefined) updateData.municipio_id = input.municipioId;
    if (input.empresaId !== undefined) updateData.empresa_id = input.empresaId;

    const { data, error } = await supabase
      .from('escolas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Atualizar relacionamentos com projetos se fornecidos
    if (input.projetosIds !== undefined) {
      // Remover relacionamentos existentes
      await supabase
        .from('escola_projetos')
        .delete()
        .eq('escola_id', id);

      // Criar novos relacionamentos se houver projetos
      if (input.projetosIds.length > 0) {
        const { error: relacionamentoError } = await supabase
          .from('escola_projetos')
          .insert(
            input.projetosIds.map(projetoId => ({
              escola_id: id,
              projeto_id: projetoId,
            }))
          );

        if (relacionamentoError) {
          throw new Error(`Erro ao vincular projetos à escola: ${relacionamentoError.message}`);
        }
      }
    }

    // Buscar relacionamentos atualizados
    const { data: relacionamentos } = await supabase
      .from('escola_projetos')
      .select('projeto_id')
      .eq('escola_id', id);

    return {
      id: data.id,
      nome: data.nome,
      municipioId: data.municipio_id,
      empresaId: data.empresa_id,
      projetosIds: relacionamentos?.map(r => r.projeto_id) || [],
      createdAt: new Date(data.created_at),
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('escolas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
