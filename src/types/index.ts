// Tipos do sistema de gestão

export type Status = 'ativo' | 'inativo' | 'finalizado';
export type StudentPhase = 'triagem' | 'consulta' | 'producao_de_oculos' | 'entregue';
export type StudentPhaseStatus = 'pendente' | 'aprovado' | 'reprovado' | 'nao_elegivel';
export type Shift = 'manha' | 'tarde' | 'integral' | 'noite';
export type Gender = 'masculino' | 'feminino' | 'outro' | 'nao_informado';
export type ArmaçãoTipo = 'masculino' | 'feminino' | 'unissex';
export type ArmaçãoStatus = 'disponivel' | 'utilizada' | 'perdida' | 'danificada';

export interface Empresa {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  status: Status;
  createdAt: Date;
}

export interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  empresaId: string;
  status: Status;
  anoAcao: string;
  municipiosIds: string[];
  createdAt: Date;
}

export interface Municipio {
  id: string;
  nome: string;
  estado: string;
  projetosIds: string[];
  createdAt: Date;
}

export interface Escola {
  id: string;
  nome: string;
  municipioId: string;
  empresaId: string;
  projetosIds: string[];
  createdAt: Date;
}

export interface Turma {
  id: string;
  nome: string;
  serie: string;
  turno: Shift;
  anoLetivo: string;
  status: Status;
  escolaId: string;
  createdAt: Date;
}

export interface Aluno {
  id: string;
  nomeCompleto: string;
  sexo: Gender;
  dataNascimento: Date;
  responsavelLegal: string;
  observacao?: string;
  turmaId: string;
  escolaId: string;
  municipioId: string;
  projetoId: string;
  empresaId: string;
  faseAtual: StudentPhase;
  armacaoId?: string;
  createdAt: Date;
}

export interface Tamanho {
  id: string;
  nome: string;
  descricao?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Armação {
  id: string;
  numeracao: string;
  tipo: ArmaçãoTipo;
  tamanhoId?: string;
  tamanho?: Tamanho;
  status: ArmaçãoStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArmaçãoHistorico {
  id: string;
  armacaoId: string;
  alunoId: string;
  dataSelecao: Date;
  status: ArmaçãoStatus;
  observacoes?: string;
  createdAt: Date;
  // Relacionamentos (opcional, para facilitar queries)
  aluno?: Aluno;
  armação?: Armação;
}

export interface HistoricoFase {
  id: string;
  alunoId: string;
  fase: StudentPhase;
  status: StudentPhaseStatus;
  data: Date;
  observacoes?: string;
  motivoInterrupcao?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  createdAt: Date;
}

export interface RelatorioAluno {
  aluno: Aluno;
  historico: HistoricoFase[];
  faseAtual: StudentPhase;
  statusAtual: StudentPhaseStatus;
}

// Estatísticas do Dashboard
export interface DashboardStats {
  totalEmpresas: number;
  projetosAtivos: number;
  municipiosAtendidos: number;
  escolasCadastradas: number;
  totalAlunos: number;
  alunosPorFase: {
    triagem: number;
    consulta: number;
    producao_de_oculos: number;
    entregue: number;
  };
}

// Tipos para Relatórios
export interface RelatorioFiltros {
  periodoInicio?: Date;
  periodoFim?: Date;
  fase?: StudentPhase[];
  escolaId?: string;
  municipioId?: string;
  empresaId?: string;
  projetoId?: string;
  faixaEtaria?: string;
  genero?: Gender;
}

export interface RelatorioGeral {
  periodo: { inicio: Date; fim: Date };
  totalAlunos: number;
  alunosPorFase: {
    triagem: number;
    consulta: number;
    producao_de_oculos: number;
    entregue: number;
  };
  distribuicaoEtaria: {
    faixa: string;
    quantidade: number;
  }[];
  distribuicaoGenero: {
    genero: Gender;
    quantidade: number;
  }[];
  taxaConclusao: number;
  idadeMedia: number;
}

export interface RelatorioEscola {
  escola: Escola;
  totalAlunos: number;
  alunosPorFase: {
    triagem: number;
    consulta: number;
    producao_de_oculos: number;
    entregue: number;
  };
  distribuicaoEtaria: {
    faixa: string;
    quantidade: number;
  }[];
  distribuicaoGenero: {
    genero: Gender;
    quantidade: number;
  }[];
  distribuicaoTurma: {
    turmaId: string;
    turmaNome: string;
    serie: string;
    turno: Shift;
    quantidade: number;
  }[];
  taxaConclusao: number;
  idadeMedia: number;
  alunos: Aluno[];
}

export interface RelatorioMunicipio {
  municipio: Municipio;
  totalEscolas: number;
  totalAlunos: number;
  alunosPorFase: {
    triagem: number;
    consulta: number;
    producao_de_oculos: number;
    entregue: number;
  };
  escolas: {
    escolaId: string;
    escolaNome: string;
    totalAlunos: number;
    taxaConclusao: number;
  }[];
  taxaConclusao: number;
}

export interface RelatorioEmpresa {
  empresa: Empresa;
  totalProjetos: number;
  totalMunicipios: number;
  totalEscolas: number;
  totalAlunos: number;
  alunosPorFase: {
    triagem: number;
    consulta: number;
    producao_de_oculos: number;
    entregue: number;
  };
  projetos: {
    projetoId: string;
    projetoNome: string;
    totalAlunos: number;
    taxaConclusao: number;
  }[];
  taxaConclusao: number;
}

export interface AlunoRelatorio extends Aluno {
  idade: number;
  escolaNome: string;
  turmaNome: string;
  municipioNome: string;
  empresaNome: string;
  diasNaFase: number;
}
