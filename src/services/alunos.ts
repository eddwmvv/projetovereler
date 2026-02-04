import { supabase } from '@/integrations/supabase/client';
import { Aluno, StudentPhase } from '@/types';
import type { Database } from '@/integrations/supabase/types';
import { escolasService } from './escolas';
import { turmasService } from './turmas';

type AlunoRow = Database['public']['Tables']['alunos']['Row'];

const alunosServiceBase = {
  async getAll(): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(transformAluno);
  },

  async getById(id: string): Promise<Aluno | null> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? transformAluno(data) : null;
  },

  async getByTurmaId(turmaId: string): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('turma_id', turmaId)
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(transformAluno);
  },
};

type CreateAlunoInput = {
  nomeCompleto: string;
  escolaId: string;
  turmaId: string;
  sexo: 'masculino' | 'feminino' | 'outro' | 'nao_informado';
  dataNascimento: Date;
  responsavelLegal: string;
  observacao?: string;
};

type UpdateAlunoInput = {
  nomeCompleto?: string;
  escolaId?: string;
  turmaId?: string;
  sexo?: 'masculino' | 'feminino' | 'outro' | 'nao_informado';
  dataNascimento?: Date;
  responsavelLegal?: string;
  observacao?: string;
  faseAtual?: 'triagem' | 'consulta' | 'producao_de_oculos' | 'entregue';
};

export const alunosService = {
  ...alunosServiceBase,
  importarAlunosEmMassa,
  
  async create(input: CreateAlunoInput): Promise<Aluno> {
    // Buscar dados da escola para obter municipioId, empresaId e projetos
    const escola = await escolasService.getById(input.escolaId);
    if (!escola) {
      throw new Error('Escola não encontrada');
    }

    // Buscar dados da turma para validar
    const turma = await turmasService.getById(input.turmaId);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }

    // Validar se a turma pertence à escola
    if (turma.escolaId !== input.escolaId) {
      throw new Error('A turma selecionada não pertence à escola selecionada');
    }

    // Se a escola tiver projetos, usar o primeiro (ou podemos fazer o usuário escolher)
    // Por enquanto, vamos usar o primeiro projeto da escola
    const projetoId = escola.projetosIds && escola.projetosIds.length > 0 
      ? escola.projetosIds[0] 
      : null;

    if (!projetoId) {
      throw new Error('A escola selecionada não possui projetos vinculados. Por favor, vincule um projeto à escola primeiro.');
    }

    const { data, error } = await supabase
      .from('alunos')
      .insert({
        nome_completo: input.nomeCompleto,
        sexo: input.sexo,
        data_nascimento: input.dataNascimento.toISOString().split('T')[0],
        responsavel_legal: input.responsavelLegal,
        observacao: input.observacao || null,
        turma_id: input.turmaId,
        escola_id: input.escolaId,
        municipio_id: escola.municipioId,
        projeto_id: projetoId,
        empresa_id: escola.empresaId,
        fase_atual: 'triagem',
      })
      .select()
      .single();

    if (error) throw error;
    return transformAluno(data);
  },

  async updateBatch(ids: string[], faseAtual: StudentPhase): Promise<void> {
    const { error } = await supabase
      .from('alunos')
      .update({ fase_atual: faseAtual })
      .in('id', ids);

    if (error) throw error;
  },

  async update(id: string, input: UpdateAlunoInput): Promise<Aluno> {
    const updateData: any = {};

    if (input.nomeCompleto !== undefined) updateData.nome_completo = input.nomeCompleto;
    if (input.sexo !== undefined) updateData.sexo = input.sexo;
    if (input.dataNascimento !== undefined) {
      updateData.data_nascimento = input.dataNascimento.toISOString().split('T')[0];
    }
    if (input.responsavelLegal !== undefined) updateData.responsavel_legal = input.responsavelLegal;
    if (input.observacao !== undefined) updateData.observacao = input.observacao || null;
    if (input.faseAtual !== undefined) updateData.fase_atual = input.faseAtual;

    // Se escola ou turma mudarem, precisamos validar e atualizar relacionamentos
    if (input.escolaId || input.turmaId) {
      const alunoAtual = await this.getById(id);
      if (!alunoAtual) {
        throw new Error('Aluno não encontrado');
      }

      const novaEscolaId = input.escolaId || alunoAtual.escolaId;
      const novaTurmaId = input.turmaId || alunoAtual.turmaId;

      // Validar turma pertence à escola
      const turma = await turmasService.getById(novaTurmaId);
      if (!turma) {
        throw new Error('Turma não encontrada');
      }
      if (turma.escolaId !== novaEscolaId) {
        throw new Error('A turma selecionada não pertence à escola selecionada');
      }

      // Buscar dados da nova escola
      const escola = await escolasService.getById(novaEscolaId);
      if (!escola) {
        throw new Error('Escola não encontrada');
      }

      const projetoId = escola.projetosIds && escola.projetosIds.length > 0 
        ? escola.projetosIds[0] 
        : null;

      if (!projetoId) {
        throw new Error('A escola selecionada não possui projetos vinculados.');
      }

      updateData.escola_id = novaEscolaId;
      updateData.turma_id = novaTurmaId;
      updateData.municipio_id = escola.municipioId;
      updateData.projeto_id = projetoId;
      updateData.empresa_id = escola.empresaId;
    }

    // O histórico de mudanças de fase é criado automaticamente pelo trigger do banco
    const { data, error } = await supabase
      .from('alunos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformAluno(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('alunos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

function transformAluno(row: AlunoRow): Aluno {
  return {
    id: row.id,
    nomeCompleto: row.nome_completo,
    sexo: row.sexo as 'masculino' | 'feminino' | 'outro' | 'nao_informado',
    dataNascimento: new Date(row.data_nascimento),
    responsavelLegal: row.responsavel_legal,
    observacao: (row as any).observacao || undefined,
    turmaId: row.turma_id,
    escolaId: row.escola_id,
    municipioId: row.municipio_id,
    projetoId: row.projeto_id,
    empresaId: row.empresa_id,
    faseAtual: row.fase_atual as 'triagem' | 'consulta' | 'producao_de_oculos' | 'entregue',
    armacaoId: (row as any)["armação_id"] || undefined,
    createdAt: new Date(row.created_at),
  };
}

// Tipos para importação
export interface AlunoImportData {
  nomeCompleto: string;
  turma: string;
  ano: string;
  sexo: 'masculino' | 'feminino' | 'outro' | 'nao_informado';
  responsavelLegal?: string;
  observacao?: string;
}

export interface ResultadoImportacao {
  sucesso: boolean;
  alunoId?: string;
  turmaId?: string;
  mensagem: string;
  dados: AlunoImportData;
}

// Função para criar ou obter turma
async function obterOuCriarTurma(
  escolaId: string,
  municipioId: string,
  projetoId: string,
  empresaId: string,
  nomeTurma: string,
  ano: string
): Promise<string> {
  try {
    // Tentar encontrar turma existente
    const { data: turmasExistentes, error: buscaError } = await supabase
      .from('turmas')
      .select('id')
      .eq('escola_id', escolaId)
      .eq('nome', nomeTurma)
      .eq('ano_letivo', ano);

    if (buscaError) throw buscaError;

    if (turmasExistentes && turmasExistentes.length > 0) {
      return turmasExistentes[0].id;
    }

    // Criar nova turma se não existir
    const { data: novaTurma, error: createError } = await supabase
      .from('turmas')
      .insert({
        nome: nomeTurma,
        serie: nomeTurma, // Usar o nome da turma como série por padrão
        turno: 'manha' as const, // Valor padrão
        ano_letivo: ano,
        status: 'ativo' as const,
        escola_id: escolaId,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (createError) throw createError;
    return novaTurma.id;
  } catch (error) {
    console.error('Erro ao obter/criar turma:', error);
    throw error;
  }
}

// Função para importar um aluno
async function importarAluno(
  dados: AlunoImportData,
  escolaId: string,
  municipioId: string,
  projetoId: string,
  empresaId: string
): Promise<ResultadoImportacao> {
  try {
    // 1. Obter ou criar turma
    const turmaId = await obterOuCriarTurma(
      escolaId,
      municipioId,
      projetoId,
      empresaId,
      dados.turma,
      dados.ano
    );

    // 2. Verificar se aluno já existe (mesmo nome na mesma turma)
    const { data: alunosExistentes, error: buscaError } = await supabase
      .from('alunos')
      .select('id')
      .eq('nome_completo', dados.nomeCompleto)
      .eq('turma_id', turmaId)
      .eq('ativo', true);

    if (buscaError) throw buscaError;

    if (alunosExistentes && alunosExistentes.length > 0) {
      return {
        sucesso: false,
        mensagem: `Aluno "${dados.nomeCompleto}" já existe nesta turma`,
        dados,
      };
    }

    // 3. Criar aluno
    const { data: novoAluno, error: createError } = await supabase
      .from('alunos')
      .insert({
        nome_completo: dados.nomeCompleto,
        sexo: dados.sexo,
        data_nascimento: new Date().toISOString(), // Data padrão, pode ser ajustada depois
        responsavel_legal: dados.responsavelLegal || '',
        observacao: dados.observacao || '',
        turma_id: turmaId,
        escola_id: escolaId,
        municipio_id: municipioId,
        projeto_id: projetoId,
        empresa_id: empresaId,
        fase_atual: 'triagem' as const,
        ativo: true,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (createError) throw createError;

    return {
      sucesso: true,
      alunoId: novoAluno.id,
      turmaId,
      mensagem: `Aluno "${dados.nomeCompleto}" importado com sucesso`,
      dados,
    };
  } catch (error) {
    return {
      sucesso: false,
      mensagem: `Erro ao importar "${dados.nomeCompleto}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      dados,
    };
  }
}

// Função para importar alunos em massa
export async function importarAlunosEmMassa(
  alunos: AlunoImportData[],
  escolaId: string,
  municipioId: string,
  projetoId: string,
  empresaId: string,
  onProgress?: (progresso: number, resultado: ResultadoImportacao) => void
): Promise<ResultadoImportacao[]> {
  const resultados: ResultadoImportacao[] = [];

  for (let i = 0; i < alunos.length; i++) {
    const resultado = await importarAluno(alunos[i], escolaId, municipioId, projetoId, empresaId);
    resultados.push(resultado);

    if (onProgress) {
      const progresso = ((i + 1) / alunos.length) * 100;
      onProgress(progresso, resultado);
    }
  }

  return resultados;
}
