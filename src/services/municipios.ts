import { supabase } from '@/integrations/supabase/client';
import { Municipio } from '@/types';
import type { Database } from '@/integrations/supabase/types';

type MunicipioRow = Database['public']['Tables']['municipios']['Row'];

const municipiosServiceBase = {
  async getAll(): Promise<Municipio[]> {
    const { data, error } = await supabase
      .from('municipios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Buscar relacionamentos separadamente
    const municipios = (data || []);
    const projetosIds = await Promise.all(
      municipios.map(async (municipio) => {
        const { data: relacionamentos } = await supabase
          .from('municipio_projetos')
          .select('projeto_id')
          .eq('municipio_id', municipio.id);
        return relacionamentos?.map(r => r.projeto_id) || [];
      })
    );

    return municipios.map((municipio, index) => ({
      id: municipio.id,
      nome: municipio.nome,
      estado: municipio.estado,
      projetosIds: projetosIds[index] || [],
      createdAt: new Date(municipio.created_at),
    }));
  },

  async getById(id: string): Promise<Municipio | null> {
    const { data, error } = await supabase
      .from('municipios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Buscar relacionamentos
    const { data: relacionamentos } = await supabase
      .from('municipio_projetos')
      .select('projeto_id')
      .eq('municipio_id', id);

    return {
      id: data.id,
      nome: data.nome,
      estado: data.estado,
      projetosIds: relacionamentos?.map(r => r.projeto_id) || [],
      createdAt: new Date(data.created_at),
    };
  },

};

type CreateMunicipioInput = {
  nome: string;
  estado: string;
  projetosIds?: string[];
};

type UpdateMunicipioInput = {
  nome?: string;
  estado?: string;
  projetosIds?: string[];
};

export const municipiosService = {
  ...municipiosServiceBase,
  
  async create(input: CreateMunicipioInput): Promise<Municipio> {
    const { data, error } = await supabase
      .from('municipios')
      .insert({
        nome: input.nome,
        estado: input.estado,
      })
      .select()
      .single();

    if (error) throw error;

    // Criar relacionamentos com projetos se fornecidos
    if (input.projetosIds && input.projetosIds.length > 0) {
      const { error: relacionamentoError } = await supabase
        .from('municipio_projetos')
        .insert(
          input.projetosIds.map(projetoId => ({
            municipio_id: data.id,
            projeto_id: projetoId,
          }))
        );

      if (relacionamentoError) {
        // Se falhar ao criar relacionamentos, tentar remover o município criado
        await supabase.from('municipios').delete().eq('id', data.id);
        throw new Error(`Erro ao vincular projetos ao município: ${relacionamentoError.message}`);
      }
    }

    return {
      id: data.id,
      nome: data.nome,
      estado: data.estado,
      projetosIds: input.projetosIds || [],
      createdAt: new Date(data.created_at),
    };
  },

  async update(id: string, input: UpdateMunicipioInput): Promise<Municipio> {
    const updateData: any = {};

    if (input.nome !== undefined) updateData.nome = input.nome;
    if (input.estado !== undefined) updateData.estado = input.estado;

    const { data, error } = await supabase
      .from('municipios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Atualizar relacionamentos com projetos se fornecidos
    if (input.projetosIds !== undefined) {
      // Remover relacionamentos existentes
      await supabase
        .from('municipio_projetos')
        .delete()
        .eq('municipio_id', id);

      // Criar novos relacionamentos se houver projetos
      if (input.projetosIds.length > 0) {
        const { error: relacionamentoError } = await supabase
          .from('municipio_projetos')
          .insert(
            input.projetosIds.map(projetoId => ({
              municipio_id: id,
              projeto_id: projetoId,
            }))
          );

        if (relacionamentoError) {
          throw new Error(`Erro ao vincular projetos ao município: ${relacionamentoError.message}`);
        }
      }
    }

    // Buscar relacionamentos atualizados
    const { data: relacionamentos } = await supabase
      .from('municipio_projetos')
      .select('projeto_id')
      .eq('municipio_id', id);

    return {
      id: data.id,
      nome: data.nome,
      estado: data.estado,
      projetosIds: relacionamentos?.map(r => r.projeto_id) || [],
      createdAt: new Date(data.created_at),
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('municipios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
