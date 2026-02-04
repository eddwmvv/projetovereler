import { supabase } from '@/integrations/supabase/client';
import { Armação, ArmaçãoHistorico, ArmaçãoTipo, ArmaçãoStatus, Tamanho } from '@/types';
import * as XLSX from 'xlsx';

type TamanhoRow = {
  id: string;
  nome: string;
  descricao: string | null;
  created_at: string;
  updated_at: string;
};

type ArmaçãoRow = {
  id: string;
  numeracao: string;
  tipo: string;
  tamanho_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type ArmacaoMovimentacaoInsert = {
  armacao_id: string;
  usuario_id: string | null;
  acao: string;
  campo: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  observacoes: string | null;
};

type ArmaçãoHistoricoRow = {
  id: string;
  'armacão_id': string; // Nome da coluna no banco (com acento)
  aluno_id: string;
  data_selecao: string;
  status: string;
  observacoes: string | null;
  created_at: string;
};

const transformTamanho = (row: TamanhoRow): Tamanho => ({
  id: row.id,
  nome: row.nome,
  descricao: row.descricao || undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const transformArmação = (row: ArmaçãoRow): Armação => ({
  id: row.id,
  numeracao: row.numeracao,
  tipo: row.tipo as ArmaçãoTipo,
  tamanhoId: row.tamanho_id || undefined,
  status: row.status as ArmaçãoStatus,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const transformArmaçãoHistorico = (row: ArmaçãoHistoricoRow): ArmaçãoHistorico => ({
  id: row.id,
  armacaoId: row['armacão_id'], // Acessar usando o nome correto da coluna
  alunoId: row.aluno_id,
  dataSelecao: new Date(row.data_selecao),
  status: row.status as ArmaçãoStatus,
  observacoes: row.observacoes || undefined,
  createdAt: new Date(row.created_at),
});

export const armacoesService = {
  // ===== TAMANHOS =====
  async getTamanhos(): Promise<Tamanho[]> {
    const { data, error } = await (supabase as any)
      .from('tamanhos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return (data || []).map(transformTamanho);
  },

  async createTamanho(input: { nome: string; descricao?: string }): Promise<Tamanho> {
    // Primeiro verificar se já existe um tamanho com esse nome
    const existingTamanho = await this.getTamanhoByNome(input.nome.trim());
    if (existingTamanho) {
      throw new Error(`Tamanho "${input.nome.trim()}" já existe no sistema`);
    }

    const { data, error } = await (supabase as any)
      .from('tamanhos')
      .insert({
        nome: input.nome.trim(),
        descricao: input.descricao?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      // Tratar erro de unicidade do banco (caso a validação acima falhe por algum motivo)
      if (error.code === '23505' && error.message.includes('tamanhos_nome_key')) {
        throw new Error(`Tamanho "${input.nome.trim()}" já existe no sistema`);
      }
      throw error;
    }

    return transformTamanho(data as TamanhoRow);
  },

  async getTamanhoById(id: string): Promise<Tamanho | null> {
    const { data, error } = await (supabase as any)
      .from('tamanhos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data ? transformTamanho(data as TamanhoRow) : null;
  },

  async getTamanhoByNome(nome: string): Promise<Tamanho | null> {
    const { data, error } = await (supabase as any)
      .from('tamanhos')
      .select('*')
      .eq('nome', nome)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data ? transformTamanho(data as TamanhoRow) : null;
  },

  // ===== ARMAÇÕES =====
  async getAll(): Promise<Armação[]> {
    const { data, error } = await (supabase as any)
      .from('armacoes')
      .select(`
        *,
        tamanho:tamanhos(*)
      `)
      .order('numeracao', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      ...transformArmação(row as ArmaçãoRow),
      tamanho: row.tamanho ? transformTamanho(row.tamanho) : undefined,
    }));
  },

  // Paginated version for better performance
  async getPaginated(page: number = 1, limit: number = 50): Promise<{ data: Armação[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get data
    const { data, error } = await (supabase as any)
      .from('armacoes')
      .select(`
        *,
        tamanho:tamanhos(*)
      `)
      .range(from, to)
      .order('numeracao', { ascending: true });

    if (error) throw error;

    // Get total count
    const { count, error: countError } = await (supabase as any)
      .from('armacoes')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    return {
      data: (data || []).map((row: any) => ({
        ...transformArmação(row as ArmaçãoRow),
        tamanho: row.tamanho ? transformTamanho(row.tamanho) : undefined,
      })),
      total: count || 0,
    };
  },

  async getDisponiveis(): Promise<Armação[]> {
    const { data, error } = await (supabase as any)
      .from('armacoes')
      .select(`
        *,
        tamanho:tamanhos(*)
      `)
      .eq('status', 'disponivel')
      .order('numeracao', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      ...transformArmação(row as ArmaçãoRow),
      tamanho: row.tamanho ? transformTamanho(row.tamanho) : undefined,
    }));
  },

  async getById(id: string): Promise<Armação | null> {
    const { data, error } = await (supabase as any)
      .from('armacoes')
      .select(`
        *,
        tamanho:tamanhos(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum registro encontrado
        return null;
      }
      throw error;
    }
    return data ? {
      ...transformArmação(data as ArmaçãoRow),
      tamanho: (data as any).tamanho ? transformTamanho((data as any).tamanho) : undefined,
    } : null;
  },

  async getByNumeracao(numeracao: string): Promise<Armação | null> {
    const { data, error } = await (supabase as any)
      .from('armacoes')
      .select(`
        *,
        tamanho:tamanhos(*)
      `)
      .eq('numeracao', numeracao)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum registro encontrado
        return null;
      }
      throw error;
    }
    return data ? {
      ...transformArmação(data as ArmaçãoRow),
      tamanho: (data as any).tamanho ? transformTamanho((data as any).tamanho) : undefined,
    } : null;
  },

  async create(input: {
    tipo: ArmaçãoTipo;
    tamanhoId?: string;
    numeracao?: string; // Numeração opcional para importação
  }): Promise<Armação> {
    let numeracaoFinal: string;

    if (input.numeracao) {
      // Usar numeração fornecida (para importação)
      numeracaoFinal = input.numeracao;
    } else {
      // Gerar numeração sequencial usando função RPC (para criação manual)
    const { data: numeracaoData, error: numeracaoError } = await (supabase as any)
      .rpc('gerar_numeracao_armacao');

    if (numeracaoError) throw numeracaoError;
      numeracaoFinal = numeracaoData;
    }

    const { data, error } = await (supabase as any)
      .from('armacoes')
      .insert({
        numeracao: numeracaoFinal,
        tipo: input.tipo,
        tamanho_id: input.tamanhoId || null,
        status: 'disponivel',
      })
      .select(`
        *,
        tamanho:tamanhos(*)
      `)
      .single();

    if (error) throw error;
    return {
      ...transformArmação(data as ArmaçãoRow),
      tamanho: (data as any).tamanho ? transformTamanho((data as any).tamanho) : undefined,
    };
  },

  async marcarComoUtilizada(
    id: string,
    alunoId: string,
    observacoes?: string
  ): Promise<void> {
    // Atualizar status da armação
    const { error: updateError } = await (supabase as any)
      .from('armacoes')
      .update({ status: 'utilizada' })
      .eq('id', id);

    if (updateError) throw updateError;

    // Registrar no histórico
    const { error: historicoError } = await (supabase as any)
      .from('armacoes_historico')
      .insert({
        'armacão_id': id, // Nome da coluna no banco
        aluno_id: alunoId,
        status: 'utilizada',
        observacoes: observacoes || null,
      });

    if (historicoError) throw historicoError;
  },

  async liberarArmacao(id: string): Promise<void> {
    // Atualizar status da armação para disponível
    const { error: updateError } = await (supabase as any)
      .from('armacoes')
      .update({ status: 'disponivel' })
      .eq('id', id);

    if (updateError) throw updateError;
  },

  async releaseCurrentArmacaoForAluno(alunoId: string): Promise<void> {
    // Usar RPC function para liberar armação
    const { error } = await (supabase as any)
      .rpc('release_current_armacao_for_aluno', { p_aluno_id: alunoId });

    if (error) throw error;
  },

  async getCurrentArmacaoForAluno(alunoId: string): Promise<Armação | null> {
    try {
      // Usar RPC function para evitar problemas com nomes de colunas especiais
      const { data, error } = await (supabase as any)
        .rpc('get_current_armacao_for_aluno', { p_aluno_id: alunoId });

      if (error) {
        console.warn('Erro ao buscar armação atual do aluno:', error.message);
        return null;
      }

      // A função RPC retorna uma tabela, então data é um array
      if (data && Array.isArray(data) && data.length > 0 && data[0].armacao_id) {
        return this.getById(data[0].armacao_id);
      }
      return null;
    } catch (err) {
      console.warn('Erro ao buscar armação atual do aluno:', err);
      return null;
    }
  },

  async getHistorico(
    alunoId?: string,
    armacaoId?: string
  ): Promise<ArmaçãoHistorico[]> {
    let query = (supabase as any)
      .from('armacoes_historico')
      .select('*')
      .order('data_selecao', { ascending: false });

    if (alunoId) {
      query = query.eq('aluno_id', alunoId);
    }

      if (armacaoId) {
        query = query.eq('armacão_id', armacaoId); // Nome da coluna no banco
      }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(transformArmaçãoHistorico);
  },

  // ===== ESTOQUE (edição manual) =====
  async updateArmacaoComAuditoria(params: {
    armacaoId: string;
    usuarioId: string;
    acao: 'alteracao' | 'saida';
    statusAnterior: ArmaçãoStatus;
    statusNovo?: ArmaçãoStatus;
    tamanhoIdAnterior?: string | null;
    tamanhoAnterior?: string | null;
    tamanhoNovo?: string | null;
    tamanhoIdNovo?: string | null;
    observacoes?: string;
  }): Promise<void> {
    const updates: Record<string, unknown> = {};
    const movimentacoes: ArmacaoMovimentacaoInsert[] = [];

    if (params.statusNovo && params.statusNovo !== params.statusAnterior) {
      updates.status = params.statusNovo;
      movimentacoes.push({
        armacao_id: params.armacaoId,
        usuario_id: params.usuarioId,
        acao: params.acao,
        campo: 'status',
        valor_anterior: params.statusAnterior,
        valor_novo: params.statusNovo,
        observacoes: params.observacoes || null,
      });
    }

    if (typeof params.tamanhoIdNovo !== 'undefined') {
      // tamanhoIdNovo pode ser string (UUID) ou null (sem tamanho)
      updates.tamanho_id = params.tamanhoIdNovo;

      const anterior = params.tamanhoAnterior ?? null;
      const novo = params.tamanhoNovo ?? null;
      if (anterior !== novo) {
        movimentacoes.push({
          armacao_id: params.armacaoId,
          usuario_id: params.usuarioId,
          acao: params.acao,
          campo: 'tamanho',
          valor_anterior: anterior,
          valor_novo: novo,
          observacoes: params.observacoes || null,
        });
      }
    }

    // Se nada mudou, não faz nada
    if (Object.keys(updates).length === 0) return;

    const rollback: Record<string, unknown> = {};
    if (typeof updates.status !== 'undefined') rollback.status = params.statusAnterior;
    if (typeof updates.tamanho_id !== 'undefined') rollback.tamanho_id = params.tamanhoIdAnterior ?? null;

    const { error: updateError } = await (supabase as any)
      .from('armacoes')
      .update(updates)
      .eq('id', params.armacaoId);

    if (updateError) throw updateError;

    if (movimentacoes.length > 0) {
      const { error: movError } = await (supabase as any)
        .from('armacoes_movimentacoes')
        .insert(movimentacoes);

      if (movError) {
        // Se não conseguiu registrar a auditoria, tenta reverter a mudança.
        if (Object.keys(rollback).length > 0) {
          await (supabase as any).from('armacoes').update(rollback).eq('id', params.armacaoId);
        }
        throw movError;
      }
    }
  },

  // ===== IMPORTAÇÃO EM MASSA =====
  async updateStatus(id: string, status: ArmaçãoStatus): Promise<void> {
    const { error } = await (supabase as any)
      .from('armacoes')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },
};

// ===== IMPORTAÇÃO EM MASSA =====
export interface ArmacaoImportRow {
  numeracao: string;
  tipo: string;
  tamanho?: string;
  status: string;
}

export interface ArmacaoImportResult {
  success: boolean;
  row: ArmacaoImportRow;
  armacao?: Armação;
  error?: string;
  isDuplicate: boolean;
}

export async function processarImportacaoArmacoes(rows: ArmacaoImportRow[]): Promise<ArmacaoImportResult[]> {
  const results: ArmacaoImportResult[] = [];

  for (const row of rows) {
    try {
      // 🔒 VALIDAÇÃO CRÍTICA: Verificar se numeração já existe no sistema
      // Esta validação PREVINE a criação de armações com numeração duplicada
      const existingArmacao = await armacoesService.getByNumeracao(row.numeracao);
      if (existingArmacao) {
        results.push({
          success: false,
          row,
          error: `Numeração "${row.numeracao}" já existe no sistema. Esta linha foi rejeitada para evitar duplicatas.`,
          isDuplicate: true,
        });
        continue;
      }

      // Validar tipo
      const tipoValido = ['masculino', 'feminino', 'unissex'].includes(row.tipo.toLowerCase());
      if (!tipoValido) {
        results.push({
          success: false,
          row,
          error: `Tipo inválido: ${row.tipo}. Deve ser masculino, feminino ou unissex`,
          isDuplicate: false,
        });
        continue;
      }

      // Validar status
      const statusValido = ['disponivel', 'utilizada', 'perdida', 'danificada'].includes(row.status.toLowerCase());
      if (!statusValido) {
        results.push({
          success: false,
          row,
          error: `Status inválido: ${row.status}. Deve ser disponivel, utilizada, perdida ou danificada`,
          isDuplicate: false,
        });
        continue;
      }

      // Buscar ou criar tamanho se fornecido
      let tamanhoId: string | undefined;
      if (row.tamanho && row.tamanho.trim()) {
        try {
          let tamanho = await armacoesService.getTamanhoByNome(row.tamanho.trim());
          if (!tamanho) {
            // Criar novo tamanho
            tamanho = await armacoesService.createTamanho({ nome: row.tamanho.trim() });
          }
          tamanhoId = tamanho.id;
        } catch (error) {
          results.push({
            success: false,
            row,
            error: `Erro ao processar tamanho "${row.tamanho.trim()}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            isDuplicate: false,
          });
          continue;
        }
      }

      // Criar armação com numeração específica do arquivo
      const armacao = await armacoesService.create({
        tipo: row.tipo.toLowerCase() as ArmaçãoTipo,
        tamanhoId,
        numeracao: row.numeracao.trim(), // Usar numeração do arquivo Excel
      });

      // Se status não for 'disponivel', atualizar
      if (row.status.toLowerCase() !== 'disponivel') {
        await armacoesService.updateStatus(armacao.id, row.status.toLowerCase() as ArmaçãoStatus);
        armacao.status = row.status.toLowerCase() as ArmaçãoStatus;
      }

      results.push({
        success: true,
        row,
        armacao,
        isDuplicate: false,
      });

    } catch (error) {
      results.push({
        success: false,
        row,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isDuplicate: false,
      });
    }
  }

  return results;
}

// Função para ler arquivo Excel
export function parseExcelFile(file: File): Promise<ArmacaoImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Pegar primeira planilha
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Verificar se tem cabeçalhos
        if (jsonData.length < 2) {
          reject(new Error('Arquivo deve conter pelo menos cabeçalhos e uma linha de dados'));
          return;
        }

        const headers = jsonData[0].map((h: any) => String(h || '').toLowerCase().trim());
        const expectedHeaders = ['numeração', 'tipo', 'tamanho', 'status'];

        // Verificar cabeçalhos obrigatórios
        const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          reject(new Error(`Cabeçalhos obrigatórios ausentes: ${missingHeaders.join(', ')}`));
          return;
        }

        // Processar linhas de dados
        const rows: ArmacaoImportRow[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.every(cell => cell === undefined || cell === null || cell === '')) {
            continue; // Pular linhas vazias
          }

          const rowData: any = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index] || '';
          });

          // Validar campos obrigatórios
          if (!rowData['numeração'] || !rowData['tipo'] || !rowData['status']) {
            reject(new Error(`Linha ${i + 1}: campos obrigatórios (numeração, tipo, status) não podem estar vazios`));
            return;
          }

          const numeracao = String(rowData['numeração']).trim();
          if (!numeracao) {
            reject(new Error(`Linha ${i + 1}: numeração não pode ser vazia ou conter apenas espaços`));
            return;
          }

          rows.push({
            numeracao,
            tipo: String(rowData['tipo']).trim(),
            tamanho: rowData['tamanho'] ? String(rowData['tamanho']).trim() : undefined,
            status: String(rowData['status']).trim(),
          });
        }

        if (rows.length === 0) {
          reject(new Error('Nenhum dado válido encontrado no arquivo'));
          return;
        }

        resolve(rows);
      } catch (error) {
        reject(new Error('Erro ao processar arquivo Excel'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsArrayBuffer(file);
  });
}
