# 📊 ANÁLISE DO ESCOPO DO SISTEMA - RELATÓRIOS E DASHBOARDS

## 🎯 VISÃO GERAL DO SISTEMA

O **Sistema Ver e Ler** é uma plataforma de gestão para acompanhamento de alunos em um fluxo de triagem visual, consulta oftalmológica, produção e entrega de óculos. O sistema gerencia:

### Entidades Principais:
- **Empresas**: Organizações executoras dos projetos
- **Projetos**: Ações/Projetos vinculados a empresas
- **Municípios**: Localidades atendidas
- **Escolas**: Instituições de ensino participantes
- **Turmas**: Classes dentro das escolas
- **Alunos**: Estudantes em acompanhamento
- **Histórico de Fases**: Rastreamento do progresso dos alunos

### Fluxo do Aluno:
1. **Triagem** → Identificação inicial
2. **Consulta** → Avaliação oftalmológica
3. **Produção de Óculos** → Fabricação dos óculos
4. **Entregue** → Óculos entregues ao aluno

---

## 📈 RELATÓRIO GERAL - ESTRUTURA PROPOSTA

### 1. VISÃO GERAL (Dashboard Principal)

#### 📊 Cards de Métricas Rápidas:
- **Total de Alunos** (com tendência %)
- **Empresas Ativas**
- **Projetos Ativos**
- **Municípios Atendidos**
- **Escolas Cadastradas**
- **Taxa de Conclusão** (% de alunos na fase "Entregue")

#### 📊 Distribuição por Fase (Gráfico de Pizza/Donut):
- Triagem: X alunos (Y%)
- Consulta: X alunos (Y%)
- Produção de Óculos: X alunos (Y%)
- Entregue: X alunos (Y%)

#### 📊 Gráfico de Linha Temporal:
- Evolução do número de alunos por fase ao longo do tempo (últimos 6-12 meses)

---

## 🎓 RELATÓRIO POR ESCOLA

### Informações Principais:
1. **Dados da Escola**
   - Nome da escola
   - Município
   - Empresa responsável
   - Projetos vinculados
   - Total de turmas
   - Total de alunos cadastrados

2. **Distribuição por Fase** (Gráfico de Barras)
   - Quantidade de alunos em cada fase
   - Percentual por fase

3. **Distribuição por Idade** (Gráfico de Histograma)
   - Faixas etárias: 0-5, 6-10, 11-15, 16-20, 21+
   - Quantidade por faixa etária

4. **Distribuição por Gênero** (Gráfico de Pizza)
   - Masculino, Feminino, Outro, Não Informado

5. **Distribuição por Turma** (Tabela/Gráfico)
   - Lista de turmas com quantidade de alunos por fase
   - Série e turno de cada turma

6. **Tempo Médio por Fase** (Gráfico de Barras)
   - Tempo médio que alunos ficam em cada fase (em dias)

7. **Taxa de Conclusão**
   - % de alunos que chegaram à fase "Entregue"
   - Comparação com média geral

---

## 📋 INFORMAÇÕES RÁPIDAS (Quick Insights)

### Cards de Resumo Rápido:
1. **Alunos Pendentes**
   - Total em Triagem
   - Total em Consulta
   - Total em Produção

2. **Alunos por Status**
   - Triagem: X alunos
   - Consulta: X alunos
   - Produção: X alunos
   - Entregue: X alunos

3. **Distribuição Etária Rápida**
   - Média de idade dos alunos
   - Idade mínima e máxima
   - Faixa etária mais comum

4. **Performance por Escola** (Top 5)
   - Escolas com mais alunos atendidos
   - Escolas com maior taxa de conclusão

5. **Performance por Município**
   - Municípios com mais alunos
   - Taxa de conclusão por município

6. **Performance por Empresa**
   - Empresas e seus respectivos números
   - Taxa de conclusão por empresa

---

## 📊 INFORMAÇÕES ABRANGENTES (Relatórios Detalhados)

### 1. RELATÓRIO DE ALUNOS POR FASE

#### Dados Incluídos:
- **Lista Completa de Alunos** por fase
- **Informações do Aluno**:
  - Nome completo
  - Idade (calculada a partir da data de nascimento)
  - Gênero
  - Escola
  - Turma
  - Município
  - Responsável legal
  - Data de entrada na fase atual
  - Tempo na fase atual (em dias)
  - Histórico de fases anteriores

#### Gráficos:
- Distribuição por idade (histograma)
- Distribuição por gênero (pizza)
- Distribuição por escola (barras horizontais)
- Distribuição por município (barras horizontais)
- Tempo médio na fase (box plot)

#### Filtros Disponíveis:
- Por fase específica
- Por escola
- Por município
- Por empresa
- Por projeto
- Por faixa etária
- Por gênero
- Por período (data de entrada)

---

### 2. RELATÓRIO POR ESCOLA (Detalhado)

#### Seções:

**A. Visão Geral**
- Total de alunos cadastrados
- Alunos ativos (não finalizados)
- Taxa de conclusão (%)
- Tempo médio do processo completo

**B. Distribuição por Fase**
- Gráfico de barras empilhadas
- Tabela com detalhamento
- Percentuais

**C. Análise Demográfica**
- Distribuição por idade (histograma)
- Distribuição por gênero (pizza)
- Distribuição por turma (barras)

**D. Performance Temporal**
- Gráfico de linha: evolução ao longo do tempo
- Alunos cadastrados por mês
- Alunos concluídos por mês

**E. Lista Detalhada de Alunos**
- Tabela completa com todos os alunos
- Filtros e ordenação
- Exportação para CSV/PDF

---

### 3. RELATÓRIO POR MUNICÍPIO

#### Informações:
- Total de escolas no município
- Total de alunos atendidos
- Distribuição por fase
- Distribuição por escola
- Taxa de conclusão
- Comparação com outros municípios
- Gráficos de evolução temporal

---

### 4. RELATÓRIO POR EMPRESA

#### Informações:
- Total de projetos
- Total de municípios atendidos
- Total de escolas
- Total de alunos
- Distribuição por fase
- Taxa de conclusão
- Performance por projeto
- Gráficos comparativos

---

### 5. RELATÓRIO DE PERFORMANCE E MÉTRICAS

#### KPIs Principais:
1. **Taxa de Conclusão Geral**
   - % de alunos que chegaram à fase "Entregue"

2. **Tempo Médio do Processo**
   - Tempo médio desde Triagem até Entregue
   - Tempo médio por fase

3. **Taxa de Abandono**
   - Alunos que não progrediram além de uma fase específica
   - Motivos de interrupção (se disponível)

4. **Eficiência por Fase**
   - Tempo médio em cada fase
   - Taxa de aprovação/reprovação por fase

5. **Distribuição Geográfica**
   - Mapa de calor por município
   - Concentração de alunos por região

---

## 📊 GRÁFICOS RECOMENDADOS

### 1. Gráficos de Distribuição:
- **Pizza/Donut**: Fases, Gênero, Status
- **Barras**: Por escola, município, empresa, turma
- **Barras Empilhadas**: Fases por escola/município
- **Histograma**: Distribuição etária

### 2. Gráficos Temporais:
- **Linha**: Evolução ao longo do tempo
- **Área Empilhada**: Acúmulo de alunos por fase
- **Candlestick**: Entradas vs Saídas por fase

### 3. Gráficos Comparativos:
- **Barras Agrupadas**: Comparação entre escolas/municípios
- **Heatmap**: Performance por escola x fase
- **Scatter Plot**: Tempo vs Taxa de conclusão

### 4. Gráficos de Performance:
- **Gauge/Speedometer**: Taxa de conclusão
- **Funnel**: Funil de conversão entre fases
- **Waterfall**: Progressão de alunos entre fases

---

## 💡 DICAS E SUGESTÕES ADICIONAIS

### 1. Funcionalidades de Exportação:
- **CSV**: Para análise em Excel/Google Sheets
- **PDF**: Para apresentações e documentação
- **Excel**: Com formatação e gráficos embutidos
- **JSON**: Para integrações com outros sistemas

### 2. Filtros e Segmentação:
- **Período**: Data inicial e final
- **Fase**: Uma ou múltiplas fases
- **Escola**: Uma ou múltiplas escolas
- **Município**: Um ou múltiplos municípios
- **Empresa**: Uma ou múltiplas empresas
- **Projeto**: Um ou múltiplos projetos
- **Idade**: Faixas etárias específicas
- **Gênero**: Filtro por gênero
- **Status**: Pendente, Aprovado, Reprovado, Não Elegível

### 3. Alertas e Notificações:
- Alunos há mais de X dias em uma fase
- Escolas com baixa taxa de conclusão
- Municípios com muitos alunos pendentes
- Projetos próximos ao prazo de conclusão

### 4. Comparações e Benchmarks:
- Comparar performance entre escolas
- Comparar performance entre municípios
- Comparar performance entre empresas
- Comparar performance entre projetos
- Comparar performance entre períodos

### 5. Análise Preditiva:
- Previsão de conclusão baseada em histórico
- Identificação de alunos em risco de atraso
- Estimativa de tempo para conclusão

### 6. Relatórios Personalizados:
- Permitir que usuários criem relatórios customizados
- Salvar templates de relatórios
- Agendar geração automática de relatórios
- Compartilhamento de relatórios

### 7. Visualizações Interativas:
- Gráficos clicáveis para drill-down
- Tooltips com informações detalhadas
- Zoom e pan em gráficos temporais
- Filtros dinâmicos que atualizam todos os gráficos

### 8. Dashboard Executivo:
- Visão consolidada para gestores
- KPIs principais em destaque
- Tendências e insights automáticos
- Alertas de performance

### 9. Relatórios Comparativos:
- Comparação período a período
- Comparação ano a ano
- Comparação entre projetos similares
- Comparação com metas estabelecidas

### 10. Análise de Tempo:
- Tempo médio por fase
- Tempo total do processo
- Identificação de gargalos
- Análise de eficiência

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA SUGERIDA

### Bibliotecas Recomendadas:
- **Gráficos**: Recharts, Chart.js, Victory, ou D3.js
- **Tabelas**: TanStack Table (React Table)
- **Exportação PDF**: jsPDF, react-pdf
- **Exportação Excel**: xlsx, exceljs
- **Filtros**: React Hook Form + Zod para validação

### Estrutura de Dados para Relatórios:

```typescript
interface RelatorioGeral {
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
  performanceEscolas: {
    escolaId: string;
    escolaNome: string;
    totalAlunos: number;
    taxaConclusao: number;
    alunosPorFase: Record<StudentPhase, number>;
  }[];
  evolucaoTemporal: {
    mes: string;
    alunosPorFase: Record<StudentPhase, number>;
  }[];
}

interface RelatorioEscola {
  escola: Escola;
  periodo: { inicio: Date; fim: Date };
  totalAlunos: number;
  alunosPorFase: Record<StudentPhase, number>;
  distribuicaoEtaria: { faixa: string; quantidade: number }[];
  distribuicaoGenero: { genero: Gender; quantidade: number }[];
  distribuicaoTurma: { turmaId: string; turmaNome: string; quantidade: number }[];
  tempoMedioPorFase: Record<StudentPhase, number>; // em dias
  taxaConclusao: number;
  alunos: Aluno[];
  evolucaoTemporal: {
    mes: string;
    totalAlunos: number;
    concluidos: number;
  }[];
}
```

---

## 📝 PRÓXIMOS PASSOS

1. **Criar serviços de relatórios** (`src/services/relatorios.ts`)
2. **Criar hooks para relatórios** (`src/hooks/use-relatorios.ts`)
3. **Criar componentes de gráficos** (`src/components/relatorios/`)
4. **Implementar página de relatórios detalhada**
5. **Adicionar funcionalidades de exportação**
6. **Criar views/materialized views no banco para performance**
7. **Implementar cache para relatórios pesados**

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Relatório Geral com cards de métricas
- [ ] Relatório por Escola com gráficos
- [ ] Relatório por Município
- [ ] Relatório por Empresa
- [ ] Relatório por Projeto
- [ ] Gráfico de distribuição por fase (pizza)
- [ ] Gráfico de distribuição etária (histograma)
- [ ] Gráfico de distribuição por gênero (pizza)
- [ ] Gráfico temporal (linha)
- [ ] Gráfico de barras por escola
- [ ] Exportação CSV
- [ ] Exportação PDF
- [ ] Filtros avançados
- [ ] Comparações entre períodos
- [ ] Dashboard executivo

---

**Documento criado em:** Janeiro 2025  
**Sistema:** Ver e Ler - Gestão de Alunos
