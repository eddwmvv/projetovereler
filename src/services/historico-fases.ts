import { supabase } from '@/integrations/supabase/client';
import { HistoricoFase, StudentPhase, StudentPhaseStatus } from '@/types';
import type { Database } from '@/integrations/supabase/types';

type HistoricoFaseRow = Database['public']['Tables']['historico_fases']['Row'];

export const historicoFasesService = {
  // Buscar histórico de mudanças de fase de um aluno
  // O histórico é criado automaticamente pelo trigger quando fase_atual é alterado
  async getByAlunoId(alunoId: string): Promise<HistoricoFase[]> {
    const { data, error } = await supabase
      .from('historico_fases')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('data', { ascending: false });

    if (error) throw error;

    // Buscar dados dos usuários separadamente
    const userIds = [...new Set((data || []).map((row: any) => row.user_id).filter(Boolean))];
    const profilesMap: Record<string, { nome_completo?: string; email?: string }> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nome_completo, email')
        .in('user_id', userIds);

      if (profiles) {
        profiles.forEach((profile: any) => {
          profilesMap[profile.user_id] = {
            nome_completo: profile.nome_completo,
            email: profile.email,
          };
        });
      }
    }

    return (data || []).map((row: any) => {
      const profile = row.user_id ? profilesMap[row.user_id] : null;
      return transformHistoricoFase(row, profile);
    });
  },
};

function transformHistoricoFase(
  row: any,
  profile?: { nome_completo?: string; email?: string } | null
): HistoricoFase {
  return {
    id: row.id,
    alunoId: row.aluno_id,
    fase: row.fase,
    status: row.status,
    data: new Date(row.data),
    observacoes: row.observacoes || undefined,
    motivoInterrupcao: row.motivo_interrupcao || undefined,
    userId: row.user_id || undefined,
    userName: profile?.nome_completo || undefined,
    userEmail: profile?.email || undefined,
    createdAt: new Date(row.created_at),
  };
}
