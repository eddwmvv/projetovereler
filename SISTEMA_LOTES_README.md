# Sistema de Gerenciamento de Lotes de Óculos

## 📋 Visão Geral

O Sistema de Lotes foi desenvolvido para gerenciar a criação, acompanhamento e recebimento de lotes de óculos destinados às escolas do projeto Ver e Ler.

## ✨ Funcionalidades

### 1. Criação de Lotes
- **Nome automático**: O sistema gera automaticamente o nome do lote seguindo o padrão LT01, LT02, LT03...
- Vincular lote a uma escola específica
- Definir turno (Manhã, Tarde, Integral, Noite)
- Adicionar múltiplos itens usando os **mesmos tamanhos das armações** (P, M, G, GG, 48, 50, 52, 54, Infantil, Adulto)
- Especificar quantidades de óculos por tamanho
- Adicionar descrição e observações

### 2. Visualização de Lotes
- Dashboard com estatísticas gerais
  - Total de lotes
  - Lotes criados
  - Lotes em preparo
  - Lotes recebidos
  - Total de óculos
- Listagem completa de todos os lotes
- Filtros por:
  - Nome do lote
  - Escola
  - Município
  - Status (Criado, Em Preparo, Recebido)

### 3. Gestão de Status
- **Criado**: Lote recém-criado, aguardando processamento
- **Em Preparo**: Lote em processo de preparação/separação
- **Recebido**: Lote recebido pela escola (status final)

### 4. Detalhes do Lote
- Informações completas do lote
- Lista de itens com quantidades
- Linha do tempo com datas de cada mudança de status
- Histórico completo de alterações
- Observações gerais

### 5. Controle de Entregas
- Acompanhamento de quantidades entregues por tamanho
- Visualização de pendências

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. `lotes`
Tabela principal que armazena os lotes de óculos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| nome | TEXT | Nome do lote |
| descricao | TEXT | Descrição opcional |
| escola_id | UUID | Referência à escola |
| turno | shift_type | Turno (manhã, tarde, integral, noite) |
| status | lote_status | Status atual (criado, em_preparo, recebido) |
| data_criacao | TIMESTAMP | Data de criação |
| data_preparo | TIMESTAMP | Data de início do preparo |
| data_recebimento | TIMESTAMP | Data de recebimento |
| observacoes | TEXT | Observações gerais |
| criado_por | UUID | Usuário que criou |

#### 2. `lote_itens`
Armazena os itens (óculos) de cada lote.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| lote_id | UUID | Referência ao lote |
| tamanho_id | UUID | Referência ao tamanho (tabela tamanhos) |
| quantidade | INTEGER | Quantidade total |
| quantidade_entregue | INTEGER | Quantidade já entregue |
| observacoes | TEXT | Observações do item |

#### 3. `lotes_historico`
Registra todas as mudanças de status dos lotes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| lote_id | UUID | Referência ao lote |
| status_anterior | lote_status | Status anterior |
| status_novo | lote_status | Novo status |
| observacoes | TEXT | Observações da mudança |
| usuario_id | UUID | Usuário que fez a alteração |
| created_at | TIMESTAMP | Data da mudança |

### Funções SQL

#### `gerar_proximo_numero_lote()`
Gera automaticamente o próximo número de lote no formato LT01, LT02, etc.

```sql
SELECT gerar_proximo_numero_lote();
-- Retorna: 'LT01' (se for o primeiro lote)
```

#### `atualizar_status_lote()`
Atualiza o status de um lote com validações e registro de histórico.

```sql
SELECT atualizar_status_lote(
  'uuid-do-lote',
  'em_preparo',
  'Observações opcionais',
  'uuid-do-usuario'
);
```

#### `buscar_lotes_com_detalhes()`
Retorna todos os lotes com informações completas (escola, município, totais).

```sql
SELECT * FROM buscar_lotes_com_detalhes();
```

## 🚀 Instalação

### Passo 1: Executar o SQL no Supabase

1. Acesse o **SQL Editor** do Supabase:
   - https://app.supabase.com/project/[seu-projeto]/sql/new

2. Abra o arquivo `EXECUTAR_NO_SUPABASE_LOTES.sql`

3. Copie todo o conteúdo do arquivo

4. Cole no SQL Editor do Supabase

5. Clique em **RUN** para executar

6. Aguarde a mensagem de sucesso

### Passo 2: Verificar a Interface

A interface já está integrada ao sistema. Para acessar:

1. Faça login no sistema

2. No menu lateral, clique em **"Lotes"**

3. A página de gerenciamento de lotes será exibida

## 📱 Uso da Interface

### Criar um Novo Lote

1. Clique no botão **"Criar Novo Lote"**
2. Preencha as informações:
   - **Nome**: Será gerado automaticamente (LT01, LT02, etc.)
   - Escola
   - Turno
   - Descrição (opcional)
3. Adicione os itens:
   - Selecione o tamanho da lista (mesmos tamanhos das armações)
   - Informe a quantidade
   - Clique em "Adicionar"
4. Adicione observações gerais se necessário
5. Clique em **"Criar Lote"**

### Visualizar Detalhes de um Lote

1. Na lista de lotes, clique em **"Ver Detalhes"**
2. A modal exibirá:
   - Informações básicas
   - Lista de itens
   - Linha do tempo
   - Histórico de mudanças
   - Observações

### Alterar Status do Lote

1. Abra os detalhes do lote
2. Role até a seção "Alterar Status"
3. Clique no botão correspondente:
   - "Marcar como Em Preparo" (se o lote está criado)
   - "Marcar como Recebido" (se o lote está em preparo)
4. Confirme a ação

**Observação**: Não é possível alterar o status de um lote já recebido.

### Filtrar Lotes

1. Use a barra de busca para procurar por:
   - Nome do lote
   - Escola
   - Município

2. Use as abas para filtrar por status:
   - Todos
   - Criados
   - Em Preparo
   - Recebidos

## 🔒 Segurança

O sistema implementa Row Level Security (RLS) com as seguintes políticas:

- ✅ Usuários autenticados podem **visualizar** todos os lotes
- ✅ Usuários autenticados podem **criar** novos lotes
- ✅ Usuários autenticados podem **editar** lotes
- ✅ Usuários autenticados podem **excluir** lotes
- ✅ Todas as alterações são registradas no histórico

## 📊 Estatísticas

O dashboard exibe:

- **Total de Lotes**: Quantidade total de lotes no sistema
- **Criados**: Lotes com status "Criado"
- **Em Preparo**: Lotes com status "Em Preparo"
- **Recebidos**: Lotes com status "Recebido"
- **Total Óculos**: Soma de todos os óculos de todos os lotes

## 🎨 Interface

### Componentes Criados

1. **LotesPage.tsx**
   - Página principal de gerenciamento
   - Listagem de lotes
   - Filtros e busca
   - Dashboard com estatísticas

2. **CreateLoteDialog.tsx**
   - Formulário de criação de lotes
   - Validação de dados
   - Adição dinâmica de itens

3. **ViewLoteDialog.tsx**
   - Visualização completa do lote
   - Histórico de mudanças
   - Alteração de status
   - Detalhes de itens

## 🔄 Fluxo de Status

```
CRIADO → EM_PREPARO → RECEBIDO
```

1. **CRIADO**: Lote é criado no sistema
   - Pode avançar para "Em Preparo"

2. **EM_PREPARO**: Lote está sendo preparado
   - Pode avançar para "Recebido"

3. **RECEBIDO**: Lote foi recebido pela escola
   - Status final, não pode ser alterado

## 🛠️ Arquivos Modificados/Criados

### Novos Arquivos

```
supabase/
├── migrations/
│   └── 20260129000000_create_lotes_system.sql
└── EXECUTAR_NO_SUPABASE_LOTES.sql

src/
├── pages/
│   └── LotesPage.tsx
├── components/
│   └── lotes/
│       ├── CreateLoteDialog.tsx
│       └── ViewLoteDialog.tsx
└── SISTEMA_LOTES_README.md
```

### Arquivos Modificados

```
src/
├── pages/
│   └── Index.tsx (adicionada rota /lotes)
└── components/
    └── layout/
        └── Sidebar.tsx (adicionado item "Lotes" no menu)
```

## 💡 Casos de Uso

### Exemplo 1: Criar um lote para Escola Municipal

1. Nome: Gerado automaticamente (ex: LT01)
2. Escola: Escola Municipal Centro
3. Turno: Manhã
4. Itens:
   - Tamanho P (Pequeno): 15 unidades
   - Tamanho M (Médio): 25 unidades
   - Tamanho 52: 10 unidades

### Exemplo 2: Acompanhar preparação

1. Lote criado com status "Criado"
2. Quando iniciar a separação dos óculos, mudar para "Em Preparo"
3. Quando a escola receber, mudar para "Recebido"

## 📝 Observações Importantes

- ⚠️ Não é possível excluir lotes que já têm itens vinculados
- ⚠️ Status "Recebido" é final e não pode ser revertido
- ✅ Todas as ações são rastreadas no histórico
- ✅ É possível adicionar múltiplos itens por lote
- ✅ **Nome do lote é gerado automaticamente** no padrão LT01, LT02, LT03...
- ✅ **Tamanhos são os mesmos das armações** (P, M, G, GG, 48, 50, 52, 54, Infantil, Adulto)

## 🐛 Troubleshooting

### Erro ao criar lote
- Verifique se todas as tabelas foram criadas corretamente
- Confirme que o usuário está autenticado
- Verifique se a escola selecionada existe

### Lotes não aparecem na lista
- Verifique as políticas RLS no Supabase
- Confirme que o SQL foi executado completamente
- Verifique o console do navegador por erros

### Não consigo alterar status
- Confirme que o lote não está no status "Recebido"
- Verifique se a função `atualizar_status_lote` existe
- Confirme as permissões do usuário

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Console do navegador (F12)
2. Logs do Supabase
3. Documentação das tabelas e funções

## 🎉 Conclusão

O Sistema de Lotes está pronto para uso! Você pode agora:
- ✅ Criar lotes de óculos por escola e turno
- ✅ Gerenciar quantidades por tamanho
- ✅ Acompanhar o status de preparação
- ✅ Visualizar histórico completo
- ✅ Gerar estatísticas e relatórios

Bom uso do sistema! 🚀
