import { DashboardStats, Aluno } from '@/types';

// ⚠️ IMPORTANTE: Dashboard usa apenas alunos ATIVOS
// Estatísticas do dashboard são baseadas apenas em alunos ativos
// Alunos inativos são gerenciados separadamente
import { empresasService } from './empresas';
import { projetosService } from './projetos';
import { municipiosService } from './municipios';
import { escolasService } from './escolas';
import { alunosService } from './alunos';
import { supabase } from '@/integrations/supabase/client';

// Função auxiliar para transformar dados do banco para o formato Aluno
function transformAluno(row: any): Aluno {
  return {
    id: row.id,
    nomeCompleto: row.nome_completo,
    sexo: row.sexo as 'masculino' | 'feminino' | 'outro' | 'nao_informado',
    dataNascimento: new Date(row.data_nascimento),
    responsavelLegal: row.responsavel_legal,
    observacao: row.observacao || undefined,
    turmaId: row.turma_id,
    escolaId: row.escola_id,
    municipioId: row.municipio_id,
    projetoId: row.projeto_id,
    empresaId: row.empresa_id,
    faseAtual: row.fase_atual as 'triagem' | 'consulta' | 'producao_de_oculos' | 'entregue',
    armacaoId: row["armação_id"] || undefined,
    createdAt: new Date(row.created_at),
  };
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [empresas, projetos, municipios, escolas] = await Promise.all([
      empresasService.getAll(),
      projetosService.getAll(),
      municipiosService.getAll(),
      escolasService.getAll(),
    ]);

    // Buscar apenas alunos ativos para o dashboard
    // Primeiro tentar usar a view alunos_relatorios, se não existir usar tabela alunos com filtro
    let alunosData: any[] = [];
    try {
      const { data, error } = await supabase
        .from('alunos_relatorios')
        .select('*');

      if (error) throw error;
      alunosData = data || [];
    } catch (error) {
      // Fallback: usar tabela alunos com filtro ativo = true
      console.warn('View alunos_relatorios não encontrada, usando fallback:', error);
      const { data, error: fallbackError } = await supabase
        .from('alunos')
        .select('*')
        .eq('ativo', true);

      if (fallbackError) throw fallbackError;
      alunosData = data || [];
    }

    // Transformar dados para o formato correto
    const alunos = alunosData.map(transformAluno);

    const alunosPorFase = alunos.reduce(
      (acc, aluno) => {
        acc[aluno.faseAtual]++;
        return acc;
      },
      { triagem: 0, consulta: 0, producao_de_oculos: 0, entregue: 0 }
    );

    return {
      totalEmpresas: empresas.length,
      projetosAtivos: projetos.filter((p) => p.status === 'ativo').length,
      municipiosAtendidos: municipios.length,
      escolasCadastradas: escolas.length,
      totalAlunos: alunos.length,
      alunosPorFase,
    };
  },
};
