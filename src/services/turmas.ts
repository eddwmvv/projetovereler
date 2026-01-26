import { supabase } from '@/integrations/supabase/client';
import { Turma } from '@/types';
import type { Database } from '@/integrations/supabase/types';

type TurmaRow = Database['public']['Tables']['turmas']['Row'];

const turmasServiceBase = {
  async getAll(): Promise<Turma[]> {
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(transformTurma);
  },

  async getById(id: string): Promise<Turma | null> {
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? transformTurma(data) : null;
  },

  async getByEscolaId(escolaId: string): Promise<Turma[]> {
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .eq('escola_id', escolaId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(transformTurma);
  },
};

type CreateTurmaInput = {
  nome: string;
  serie: string;
  turno: 'manha' | 'tarde' | 'integral' | 'noite';
  anoLetivo: string;
  status?: 'ativo' | 'inativo' | 'finalizado';
  escolaId: string;
};

type UpdateTurmaInput = {
  nome?: string;
  serie?: string;
  turno?: 'manha' | 'tarde' | 'integral' | 'noite';
  anoLetivo?: string;
  status?: 'ativo' | 'inativo' | 'finalizado';
  escolaId?: string;
};

export const turmasService = {
  ...turmasServiceBase,
  
  async create(input: CreateTurmaInput): Promise<Turma> {
    const { data, error } = await supabase
      .from('turmas')
      .insert({
        nome: input.nome,
        serie: input.serie,
        turno: input.turno,
        ano_letivo: input.anoLetivo,
        status: input.status || 'ativo',
        escola_id: input.escolaId,
      })
      .select()
      .single();

    if (error) throw error;
    return transformTurma(data);
  },

  async update(id: string, input: UpdateTurmaInput): Promise<Turma> {
    const updateData: any = {};

    if (input.nome !== undefined) updateData.nome = input.nome;
    if (input.serie !== undefined) updateData.serie = input.serie;
    if (input.turno !== undefined) updateData.turno = input.turno;
    if (input.anoLetivo !== undefined) updateData.ano_letivo = input.anoLetivo;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.escolaId !== undefined) updateData.escola_id = input.escolaId;

    const { data, error } = await supabase
      .from('turmas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformTurma(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('turmas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

function transformTurma(row: TurmaRow): Turma {
  return {
    id: row.id,
    nome: row.nome,
    serie: row.serie,
    turno: row.turno as 'manha' | 'tarde' | 'integral' | 'noite',
    anoLetivo: row.ano_letivo,
    status: row.status as 'ativo' | 'inativo' | 'finalizado',
    escolaId: row.escola_id,
    createdAt: new Date(row.created_at),
  };
}
