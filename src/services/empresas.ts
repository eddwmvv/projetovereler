import { supabase } from '@/integrations/supabase/client';
import { Empresa } from '@/types';
import type { Database } from '@/integrations/supabase/types';

type EmpresaRow = Database['public']['Tables']['empresas']['Row'];

type CreateEmpresaInput = {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  status?: 'ativo' | 'inativo' | 'finalizado';
};

type UpdateEmpresaInput = {
  nomeFantasia?: string;
  razaoSocial?: string;
  cnpj?: string;
  status?: 'ativo' | 'inativo' | 'finalizado';
};

export const empresasService = {
  async getAll(): Promise<Empresa[]> {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(transformEmpresa);
  },

  async getById(id: string): Promise<Empresa | null> {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? transformEmpresa(data) : null;
  },

  async create(input: CreateEmpresaInput): Promise<Empresa> {
    const { data, error } = await supabase
      .from('empresas')
      .insert({
        nome_fantasia: input.nomeFantasia,
        razao_social: input.razaoSocial,
        cnpj: input.cnpj,
        status: input.status || 'ativo',
      })
      .select()
      .single();

    if (error) throw error;
    return transformEmpresa(data);
  },

  async update(id: string, input: UpdateEmpresaInput): Promise<Empresa> {
    const updateData: any = {};

    if (input.nomeFantasia !== undefined) updateData.nome_fantasia = input.nomeFantasia;
    if (input.razaoSocial !== undefined) updateData.razao_social = input.razaoSocial;
    if (input.cnpj !== undefined) updateData.cnpj = input.cnpj;
    if (input.status !== undefined) updateData.status = input.status;

    const { data, error } = await supabase
      .from('empresas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformEmpresa(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

function transformEmpresa(row: EmpresaRow): Empresa {
  return {
    id: row.id,
    nomeFantasia: row.nome_fantasia,
    razaoSocial: row.razao_social,
    cnpj: row.cnpj,
    status: row.status as 'ativo' | 'inativo' | 'finalizado',
    createdAt: new Date(row.created_at),
  };
}
