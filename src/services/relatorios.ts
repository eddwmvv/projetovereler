import { supabase } from '@/integrations/supabase/client';

// ⚠️ IMPORTANTE: Todos os relatórios usam apenas alunos ATIVOS
// As queries foram atualizadas para usar 'alunos_relatorios' em vez de 'alunos'
// para garantir que alunos inativos não apareçam nos relatórios
import {
  RelatorioFiltros,
  RelatorioGeral,
  RelatorioEscola,
  RelatorioMunicipio,
  RelatorioEmpresa,
  AlunoRelatorio,
  Aluno,
  Escola,
  Municipio,
  Empresa,
  StudentPhase,
} from '@/types';
import { alunosService } from './alunos';
import { escolasService } from './escolas';
import { municipiosService } from './municipios';
import { empresasService } from './empresas';
import { turmasService } from './turmas';

// Função auxiliar para calcular idade
function calcularIdade(dataNascimento: Date): number {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}

// Função auxiliar para calcular dias na fase atual
function calcularDiasNaFase(aluno: Aluno): number {
  const hoje = new Date();
  const criadoEm = new Date(aluno.createdAt);
  return Math.floor((hoje.getTime() - criadoEm.getTime()) / (1000 * 60 * 60 * 24));
}

// Função auxiliar para obter faixa etária
function obterFaixaEtaria(idade: number): string {
  if (idade <= 5) return '0-5 anos';
  if (idade <= 10) return '6-10 anos';
  if (idade <= 15) return '11-15 anos';
  if (idade <= 20) return '16-20 anos';
  return '21+ anos';
}

export const relatoriosService = {
  // Relatório Geral - Apenas alunos ativos
  async getRelatorioGeral(filtros?: RelatorioFiltros): Promise<RelatorioGeral> {
    let query = supabase.from('alunos_relatorios').select('*, escolas(nome), turmas(nome), municipios(nome), empresas(nome_fantasia)');

    // Aplicar filtros
    if (filtros?.periodoInicio) {
      query = query.gte('created_at', filtros.periodoInicio.toISOString());
    }
    if (filtros?.periodoFim) {
      query = query.lte('created_at', filtros.periodoFim.toISOString());
    }
    if (filtros?.fase && filtros.fase.length > 0) {
      query = query.in('fase_atual', filtros.fase);
    }
    if (filtros?.escolaId) {
      query = query.eq('escola_id', filtros.escolaId);
    }
    if (filtros?.municipioId) {
      query = query.eq('municipio_id', filtros.municipioId);
    }
    if (filtros?.empresaId) {
      query = query.eq('empresa_id', filtros.empresaId);
    }
    if (filtros?.projetoId) {
      query = query.eq('projeto_id', filtros.projetoId);
    }
    if (filtros?.genero) {
      query = query.eq('sexo', filtros.genero);
    }

    const { data, error } = await query;

    if (error) throw error;

    const alunos = (data || []).map((row: any) => ({
      id: row.id,
      nomeCompleto: row.nome_completo,
      sexo: row.sexo,
      dataNascimento: new Date(row.data_nascimento),
      responsavelLegal: row.responsavel_legal,
      observacao: row.observacao,
      turmaId: row.turma_id,
      escolaId: row.escola_id,
      municipioId: row.municipio_id,
      projetoId: row.projeto_id,
      empresaId: row.empresa_id,
      faseAtual: row.fase_atual,
      createdAt: new Date(row.created_at),
    }));

    const totalAlunos = alunos.length;

    // Calcular distribuição por fase
    const alunosPorFase = alunos.reduce(
      (acc, aluno) => {
        acc[aluno.faseAtual]++;
        return acc;
      },
      { triagem: 0, consulta: 0, producao_de_oculos: 0, entregue: 0 }
    );

    // Calcular distribuição etária
    const distribuicaoEtaria = alunos.reduce((acc, aluno) => {
      const idade = calcularIdade(aluno.dataNascimento);
      const faixa = obterFaixaEtaria(idade);
      acc[faixa] = (acc[faixa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const distribuicaoEtariaArray = Object.entries(distribuicaoEtaria).map(([faixa, quantidade]) => ({
      faixa,
      quantidade,
    }));

    // Calcular distribuição por gênero
    const distribuicaoGenero = alunos.reduce((acc, aluno) => {
      acc[aluno.sexo] = (acc[aluno.sexo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const distribuicaoGeneroArray = Object.entries(distribuicaoGenero).map(([genero, quantidade]) => ({
      genero: genero as any,
      quantidade,
    }));

    // Calcular taxa de conclusão
    const taxaConclusao = totalAlunos > 0 ? (alunosPorFase.entregue / totalAlunos) * 100 : 0;

    // Calcular idade média
    const idades = alunos.map((a) => calcularIdade(a.dataNascimento));
    const idadeMedia = idades.length > 0 ? idades.reduce((a, b) => a + b, 0) / idades.length : 0;

    // Filtrar por faixa etária se especificado
    let alunosFiltrados = alunos;
    if (filtros?.faixaEtaria) {
      alunosFiltrados = alunos.filter((a) => {
        const idade = calcularIdade(a.dataNascimento);
        return obterFaixaEtaria(idade) === filtros.faixaEtaria;
      });
    }

    // Calcular período padrão se não houver filtros
    let periodoInicio = filtros?.periodoInicio;
    let periodoFim = filtros?.periodoFim;

    if (!periodoInicio || !periodoFim) {
      // Se não houver filtros de período, usar a data do primeiro aluno ou 1 ano atrás
      if (alunos.length > 0) {
        const datas = alunos.map((a) => a.createdAt.getTime()).sort((a, b) => a - b);
        periodoInicio = periodoInicio || new Date(datas[0]);
        periodoFim = periodoFim || new Date();
      } else {
        // Se não houver alunos, usar 1 ano atrás até hoje
        periodoInicio = periodoInicio || new Date();
        periodoInicio.setFullYear(periodoInicio.getFullYear() - 1);
        periodoFim = periodoFim || new Date();
      }
    }

    return {
      periodo: {
        inicio: periodoInicio,
        fim: periodoFim,
      },
      totalAlunos: alunosFiltrados.length,
      alunosPorFase,
      distribuicaoEtaria: distribuicaoEtariaArray,
      distribuicaoGenero: distribuicaoGeneroArray,
      taxaConclusao,
      idadeMedia,
    };
  },

  // Relatório por Escola
  async getRelatorioEscola(escolaId: string, filtros?: RelatorioFiltros): Promise<RelatorioEscola> {
    const escola = await escolasService.getById(escolaId);
    if (!escola) {
      throw new Error('Escola não encontrada');
    }

    let query = supabase
      .from('alunos_relatorios')
      .select('*, turmas(nome, serie, turno)')
      .eq('escola_id', escolaId);

    if (filtros?.periodoInicio) {
      query = query.gte('created_at', filtros.periodoInicio.toISOString());
    }
    if (filtros?.periodoFim) {
      query = query.lte('created_at', filtros.periodoFim.toISOString());
    }
    if (filtros?.fase && filtros.fase.length > 0) {
      query = query.in('fase_atual', filtros.fase);
    }
    if (filtros?.genero) {
      query = query.eq('sexo', filtros.genero);
    }

    const { data, error } = await query;

    if (error) throw error;

    const alunos = (data || []).map((row: any) => ({
      id: row.id,
      nomeCompleto: row.nome_completo,
      sexo: row.sexo,
      dataNascimento: new Date(row.data_nascimento),
      responsavelLegal: row.responsavel_legal,
      observacao: row.observacao,
      turmaId: row.turma_id,
      escolaId: row.escola_id,
      municipioId: row.municipio_id,
      projetoId: row.projeto_id,
      empresaId: row.empresa_id,
      faseAtual: row.fase_atual,
      createdAt: new Date(row.created_at),
    }));

    const totalAlunos = alunos.length;

    const alunosPorFase = alunos.reduce(
      (acc, aluno) => {
        acc[aluno.faseAtual]++;
        return acc;
      },
      { triagem: 0, consulta: 0, producao_de_oculos: 0, entregue: 0 }
    );

    const distribuicaoEtaria = alunos.reduce((acc, aluno) => {
      const idade = calcularIdade(aluno.dataNascimento);
      const faixa = obterFaixaEtaria(idade);
      acc[faixa] = (acc[faixa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const distribuicaoEtariaArray = Object.entries(distribuicaoEtaria).map(([faixa, quantidade]) => ({
      faixa,
      quantidade,
    }));

    const distribuicaoGenero = alunos.reduce((acc, aluno) => {
      acc[aluno.sexo] = (acc[aluno.sexo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const distribuicaoGeneroArray = Object.entries(distribuicaoGenero).map(([genero, quantidade]) => ({
      genero: genero as any,
      quantidade,
    }));

    // Distribuição por turma
    const distribuicaoTurma = alunos.reduce((acc, aluno) => {
      const turmaId = aluno.turmaId;
      if (!acc[turmaId]) {
        acc[turmaId] = { turmaId, quantidade: 0, turmaNome: '', serie: '', turno: '' as any };
      }
      acc[turmaId].quantidade++;
      return acc;
    }, {} as Record<string, { turmaId: string; quantidade: number; turmaNome: string; serie: string; turno: any }>);

    // Buscar dados das turmas
    const turmasIds = Object.keys(distribuicaoTurma);
    const turmasData = await Promise.all(turmasIds.map((id) => turmasService.getById(id)));

    const distribuicaoTurmaArray = turmasData
      .filter((t) => t !== null)
      .map((turma) => ({
        turmaId: turma!.id,
        turmaNome: turma!.nome,
        serie: turma!.serie,
        turno: turma!.turno,
        quantidade: distribuicaoTurma[turma!.id].quantidade,
      }));

    const taxaConclusao = totalAlunos > 0 ? (alunosPorFase.entregue / totalAlunos) * 100 : 0;
    const idades = alunos.map((a) => calcularIdade(a.dataNascimento));
    const idadeMedia = idades.length > 0 ? idades.reduce((a, b) => a + b, 0) / idades.length : 0;

    return {
      escola,
      totalAlunos,
      alunosPorFase,
      distribuicaoEtaria: distribuicaoEtariaArray,
      distribuicaoGenero: distribuicaoGeneroArray,
      distribuicaoTurma: distribuicaoTurmaArray,
      taxaConclusao,
      idadeMedia,
      alunos,
    };
  },

  // Relatório por Município
  async getRelatorioMunicipio(municipioId: string, filtros?: RelatorioFiltros): Promise<RelatorioMunicipio> {
    const municipio = await municipiosService.getById(municipioId);
    if (!municipio) {
      throw new Error('Município não encontrado');
    }

    const escolas = await escolasService.getAll();
    const escolasMunicipio = escolas.filter((e) => e.municipioId === municipioId);

    let query = supabase.from('alunos_relatorios').select('*, escolas(nome)').eq('municipio_id', municipioId);

    if (filtros?.periodoInicio) {
      query = query.gte('created_at', filtros.periodoInicio.toISOString());
    }
    if (filtros?.periodoFim) {
      query = query.lte('created_at', filtros.periodoFim.toISOString());
    }
    if (filtros?.fase && filtros.fase.length > 0) {
      query = query.in('fase_atual', filtros.fase);
    }

    const { data, error } = await query;

    if (error) throw error;

    const alunos = (data || []).map((row: any) => ({
      id: row.id,
      nomeCompleto: row.nome_completo,
      sexo: row.sexo,
      dataNascimento: new Date(row.data_nascimento),
      responsavelLegal: row.responsavel_legal,
      observacao: row.observacao,
      turmaId: row.turma_id,
      escolaId: row.escola_id,
      municipioId: row.municipio_id,
      projetoId: row.projeto_id,
      empresaId: row.empresa_id,
      faseAtual: row.fase_atual,
      createdAt: new Date(row.created_at),
    }));

    const totalAlunos = alunos.length;

    const alunosPorFase = alunos.reduce(
      (acc, aluno) => {
        acc[aluno.faseAtual]++;
        return acc;
      },
      { triagem: 0, consulta: 0, producao_de_oculos: 0, entregue: 0 }
    );

    // Estatísticas por escola
    const escolasStats = escolasMunicipio.map((escola) => {
      const alunosEscola = alunos.filter((a) => a.escolaId === escola.id);
      const entregues = alunosEscola.filter((a) => a.faseAtual === 'entregue').length;
      const taxaConclusao = alunosEscola.length > 0 ? (entregues / alunosEscola.length) * 100 : 0;

      return {
        escolaId: escola.id,
        escolaNome: escola.nome,
        totalAlunos: alunosEscola.length,
        taxaConclusao,
      };
    });

    const taxaConclusao = totalAlunos > 0 ? (alunosPorFase.entregue / totalAlunos) * 100 : 0;

    return {
      municipio,
      totalEscolas: escolasMunicipio.length,
      totalAlunos,
      alunosPorFase,
      escolas: escolasStats,
      taxaConclusao,
    };
  },

  // Relatório por Empresa
  async getRelatorioEmpresa(empresaId: string, filtros?: RelatorioFiltros): Promise<RelatorioEmpresa> {
    const empresa = await empresasService.getById(empresaId);
    if (!empresa) {
      throw new Error('Empresa não encontrada');
    }

    const projetos = await supabase.from('projetos').select('*').eq('empresa_id', empresaId);
    const projetosData = (projetos.data || []).map((p: any) => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      empresaId: p.empresa_id,
      status: p.status,
      anoAcao: p.ano_acao,
      municipiosIds: [],
      createdAt: new Date(p.created_at),
    }));

    let query = supabase.from('alunos_relatorios').select('*').eq('empresa_id', empresaId);

    if (filtros?.periodoInicio) {
      query = query.gte('created_at', filtros.periodoInicio.toISOString());
    }
    if (filtros?.periodoFim) {
      query = query.lte('created_at', filtros.periodoFim.toISOString());
    }
    if (filtros?.fase && filtros.fase.length > 0) {
      query = query.in('fase_atual', filtros.fase);
    }

    const { data, error } = await query;

    if (error) throw error;

    const alunos = (data || []).map((row: any) => ({
      id: row.id,
      nomeCompleto: row.nome_completo,
      sexo: row.sexo,
      dataNascimento: new Date(row.data_nascimento),
      responsavelLegal: row.responsavel_legal,
      observacao: row.observacao,
      turmaId: row.turma_id,
      escolaId: row.escola_id,
      municipioId: row.municipio_id,
      projetoId: row.projeto_id,
      empresaId: row.empresa_id,
      faseAtual: row.fase_atual,
      createdAt: new Date(row.created_at),
    }));

    const totalAlunos = alunos.length;

    const alunosPorFase = alunos.reduce(
      (acc, aluno) => {
        acc[aluno.faseAtual]++;
        return acc;
      },
      { triagem: 0, consulta: 0, producao_de_oculos: 0, entregue: 0 }
    );

    // Estatísticas por projeto
    const projetosStats = projetosData.map((projeto) => {
      const alunosProjeto = alunos.filter((a) => a.projetoId === projeto.id);
      const entregues = alunosProjeto.filter((a) => a.faseAtual === 'entregue').length;
      const taxaConclusao = alunosProjeto.length > 0 ? (entregues / alunosProjeto.length) * 100 : 0;

      return {
        projetoId: projeto.id,
        projetoNome: projeto.nome,
        totalAlunos: alunosProjeto.length,
        taxaConclusao,
      };
    });

    const taxaConclusao = totalAlunos > 0 ? (alunosPorFase.entregue / totalAlunos) * 100 : 0;

    // Contar municípios e escolas únicos
    const municipiosUnicos = new Set(alunos.map((a) => a.municipioId));
    const escolasUnicas = new Set(alunos.map((a) => a.escolaId));

    return {
      empresa,
      totalProjetos: projetosData.length,
      totalMunicipios: municipiosUnicos.size,
      totalEscolas: escolasUnicas.size,
      totalAlunos,
      alunosPorFase,
      projetos: projetosStats,
      taxaConclusao,
    };
  },

  // Lista de alunos para exportação - Apenas alunos ativos
  async getAlunosParaExportacao(filtros?: RelatorioFiltros): Promise<AlunoRelatorio[]> {
    let query = supabase
      .from('alunos_relatorios')
      .select('*, escolas(nome), turmas(nome), municipios(nome), empresas(nome_fantasia)');

    if (filtros?.periodoInicio) {
      query = query.gte('created_at', filtros.periodoInicio.toISOString());
    }
    if (filtros?.periodoFim) {
      query = query.lte('created_at', filtros.periodoFim.toISOString());
    }
    if (filtros?.fase && filtros.fase.length > 0) {
      query = query.in('fase_atual', filtros.fase);
    }
    if (filtros?.escolaId) {
      query = query.eq('escola_id', filtros.escolaId);
    }
    if (filtros?.municipioId) {
      query = query.eq('municipio_id', filtros.municipioId);
    }
    if (filtros?.empresaId) {
      query = query.eq('empresa_id', filtros.empresaId);
    }
    if (filtros?.projetoId) {
      query = query.eq('projeto_id', filtros.projetoId);
    }
    if (filtros?.genero) {
      query = query.eq('sexo', filtros.genero);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((row: any) => {
      const aluno: Aluno = {
        id: row.id,
        nomeCompleto: row.nome_completo,
        sexo: row.sexo,
        dataNascimento: new Date(row.data_nascimento),
        responsavelLegal: row.responsavel_legal,
        observacao: row.observacao,
        turmaId: row.turma_id,
        escolaId: row.escola_id,
        municipioId: row.municipio_id,
        projetoId: row.projeto_id,
        empresaId: row.empresa_id,
        faseAtual: row.fase_atual,
        createdAt: new Date(row.created_at),
      };

      return {
        ...aluno,
        idade: calcularIdade(aluno.dataNascimento),
        escolaNome: row.escolas?.nome || 'N/A',
        turmaNome: row.turmas?.nome || 'N/A',
        municipioNome: row.municipios?.nome || 'N/A',
        empresaNome: row.empresas?.nome_fantasia || 'N/A',
        diasNaFase: calcularDiasNaFase(aluno),
      };
    });
  },
};
