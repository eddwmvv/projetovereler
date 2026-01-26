import { Empresa, Projeto, Municipio, Escola, Turma, Aluno, DashboardStats } from '@/types';

export const empresas: Empresa[] = [
  {
    id: '1',
    nomeFantasia: 'Instituto Visão Clara',
    razaoSocial: 'Instituto Visão Clara Ltda',
    cnpj: '12.345.678/0001-90',
    status: 'ativo',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    nomeFantasia: 'Fundação Olhar Futuro',
    razaoSocial: 'Fundação Olhar Futuro',
    cnpj: '98.765.432/0001-10',
    status: 'ativo',
    createdAt: new Date('2024-02-20'),
  },
];

export const projetos: Projeto[] = [
  {
    id: '1',
    nome: 'Olhar Saudável 2026',
    descricao: 'Programa de saúde visual para escolas públicas',
    empresaId: '1',
    status: 'ativo',
    anoAcao: '2026-1',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: '2',
    nome: 'Visão na Escola',
    descricao: 'Triagem e atendimento oftalmológico escolar',
    empresaId: '1',
    status: 'ativo',
    anoAcao: '2026-1',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: '3',
    nome: 'Enxergando o Futuro',
    descricao: 'Projeto de distribuição de óculos para estudantes',
    empresaId: '2',
    status: 'ativo',
    anoAcao: '2026-1',
    createdAt: new Date('2026-01-01'),
  },
];

export const municipios: Municipio[] = [
  {
    id: '1',
    nome: 'São Paulo',
    estado: 'SP',
    empresaId: '1',
    projetosIds: ['1', '2'],
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '2',
    nome: 'Rio de Janeiro',
    estado: 'RJ',
    empresaId: '1',
    projetosIds: ['1'],
    createdAt: new Date('2024-03-15'),
  },
  {
    id: '3',
    nome: 'Belo Horizonte',
    estado: 'MG',
    empresaId: '2',
    projetosIds: ['3'],
    createdAt: new Date('2024-04-01'),
  },
  {
    id: '4',
    nome: 'Curitiba',
    estado: 'PR',
    empresaId: '2',
    projetosIds: ['3'],
    createdAt: new Date('2024-04-10'),
  },
];

export const escolas: Escola[] = [
  {
    id: '1',
    nome: 'E.E. Prof. João da Silva',
    municipioId: '1',
    empresaId: '1',
    projetosIds: ['1'],
    createdAt: new Date('2024-05-01'),
  },
  {
    id: '2',
    nome: 'E.M. Maria José',
    municipioId: '1',
    empresaId: '1',
    projetosIds: ['1', '2'],
    createdAt: new Date('2024-05-05'),
  },
  {
    id: '3',
    nome: 'Colégio Municipal Santos Dumont',
    municipioId: '2',
    empresaId: '1',
    projetosIds: ['1'],
    createdAt: new Date('2024-05-10'),
  },
  {
    id: '4',
    nome: 'E.E. Tiradentes',
    municipioId: '3',
    empresaId: '2',
    projetosIds: ['3'],
    createdAt: new Date('2024-05-15'),
  },
  {
    id: '5',
    nome: 'E.M. Rui Barbosa',
    municipioId: '4',
    empresaId: '2',
    projetosIds: ['3'],
    createdAt: new Date('2024-05-20'),
  },
];

export const turmas: Turma[] = [
  {
    id: '1',
    nome: '1º Ano A',
    serie: '1º Ano',
    turno: 'manha',
    anoLetivo: '2026',
    status: 'ativo',
    escolaId: '1',
    createdAt: new Date('2026-01-15'),
  },
  {
    id: '2',
    nome: '2º Ano B',
    serie: '2º Ano',
    turno: 'tarde',
    anoLetivo: '2026',
    status: 'ativo',
    escolaId: '1',
    createdAt: new Date('2026-01-15'),
  },
  {
    id: '3',
    nome: '3º Ano A',
    serie: '3º Ano',
    turno: 'manha',
    anoLetivo: '2026',
    status: 'ativo',
    escolaId: '2',
    createdAt: new Date('2026-01-15'),
  },
  {
    id: '4',
    nome: '4º Ano C',
    serie: '4º Ano',
    turno: 'integral',
    anoLetivo: '2026',
    status: 'ativo',
    escolaId: '3',
    createdAt: new Date('2026-01-15'),
  },
  {
    id: '5',
    nome: '5º Ano A',
    serie: '5º Ano',
    turno: 'manha',
    anoLetivo: '2026',
    status: 'ativo',
    escolaId: '4',
    createdAt: new Date('2026-01-15'),
  },
];

export const alunos: Aluno[] = [
  {
    id: '1',
    nomeCompleto: 'Ana Clara Santos',
    sexo: 'feminino',
    dataNascimento: new Date('2018-03-15'),
    responsavelLegal: 'Maria Santos',
    turmaId: '1',
    escolaId: '1',
    municipioId: '1',
    projetoId: '1',
    empresaId: '1',
    faseAtual: 'consulta',
    createdAt: new Date('2026-01-20'),
  },
  {
    id: '2',
    nomeCompleto: 'Pedro Henrique Lima',
    sexo: 'masculino',
    dataNascimento: new Date('2017-08-22'),
    responsavelLegal: 'José Lima',
    turmaId: '2',
    escolaId: '1',
    municipioId: '1',
    projetoId: '1',
    empresaId: '1',
    faseAtual: 'triagem',
    createdAt: new Date('2026-01-21'),
  },
  {
    id: '3',
    nomeCompleto: 'Mariana Oliveira',
    sexo: 'feminino',
    dataNascimento: new Date('2016-12-05'),
    responsavelLegal: 'Carla Oliveira',
    turmaId: '3',
    escolaId: '2',
    municipioId: '1',
    projetoId: '2',
    empresaId: '1',
    faseAtual: 'producao_de_oculos',
    createdAt: new Date('2026-01-22'),
  },
  {
    id: '4',
    nomeCompleto: 'Lucas Gabriel Souza',
    sexo: 'masculino',
    dataNascimento: new Date('2015-06-18'),
    responsavelLegal: 'Amanda Souza',
    turmaId: '4',
    escolaId: '3',
    municipioId: '2',
    projetoId: '1',
    empresaId: '1',
    faseAtual: 'triagem',
    createdAt: new Date('2026-01-23'),
  },
  {
    id: '5',
    nomeCompleto: 'Isabela Ferreira',
    sexo: 'feminino',
    dataNascimento: new Date('2016-09-30'),
    responsavelLegal: 'Roberto Ferreira',
    turmaId: '5',
    escolaId: '4',
    municipioId: '3',
    projetoId: '3',
    empresaId: '2',
    faseAtual: 'consulta',
    createdAt: new Date('2026-01-24'),
  },
];

export const getDashboardStats = (): DashboardStats => {
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
};
