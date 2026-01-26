# 🔄 Sistema de Alunos Inativos/Desligados

## 📋 Visão Geral

Este sistema implementa um **soft delete** para alunos, mantendo todos os registros no banco de dados mas marcando-os como inativos quando "excluídos". Isso garante:

- ✅ **Auditoria completa**: Histórico de quem excluiu e quando
- ✅ **Compliance**: Dados preservados para conformidade legal
- ✅ **Recuperação**: Possibilidade de reativar alunos
- ✅ **Relatórios**: Análises focadas apenas em alunos ativos
- ✅ **Integração com Armações**: Armações são automaticamente liberadas
- ✅ **Integridade**: Sem perda de dados relacionais

## 🗄️ Estrutura do Banco de Dados

### Campos Adicionados à Tabela `alunos`:

```sql
ativo BOOLEAN NOT NULL DEFAULT true                    -- Status ativo/inativo
desligado_por UUID REFERENCES auth.users(id)          -- Usuário que desligou
data_desligamento TIMESTAMP WITH TIME ZONE            -- Quando foi desligado
motivo_desligamento TEXT                              -- Motivo opcional
```

### Views Criadas:

- **`alunos_ativos`**: View com alunos ativos (compatibilidade)
- **`alunos_relatorios`**: View específica para relatórios (apenas ativos)
- **`alunos_inativos`**: View com alunos inativos + dados do usuário

### Funções Disponíveis:

- **`desligar_aluno(aluno_id, user_id, motivo)`**: Marca aluno como inativo
- **`reativar_aluno(aluno_id)`**: Reativa aluno previamente desligado (volta para fase triagem)

## 🚀 Como Usar

### 1. **No Frontend - Modificar Exclusão**

Ao invés de excluir fisicamente:

```typescript
// ❌ Antes (exclusão física)
await deleteAluno.mutateAsync(alunoId);

// ✅ Agora (desligamento)
await updateAluno.mutateAsync({
  id: alunoId,
  data: {
    ativo: false,
    desligado_por: currentUser.id,
    data_desligamento: new Date(),
    motivo_desligamento: motivo // opcional
  }
});
```

### 2. **Queries Atualizadas**

#### Buscar apenas alunos ativos:
```sql
SELECT * FROM alunos WHERE ativo = true;
-- ou use a view: SELECT * FROM alunos_ativos;
```

#### Para relatórios (apenas ativos):
```sql
SELECT * FROM alunos_relatorios; -- view otimizada para relatórios
```

#### Buscar alunos inativos:
```sql
SELECT * FROM alunos_inativos; -- inclui dados do usuário
```

#### Buscar todos os alunos (apenas para admin):
```sql
SELECT * FROM alunos; -- ativo e inativo
```

### 🔄 **Liberação Automática de Armações**

Quando um aluno é **desligado**, se ele tiver uma armação vinculada:

- ✅ **Armação liberada**: Status volta para "disponível"
- ✅ **Histórico removido**: Registro de vinculação é excluído
- ✅ **Estoque atualizado**: Armação volta ao estoque disponível

**Fluxo automático:**
```
Aluno Desligado → Verifica Armação Vinculada → Libera Armação → Volta ao Estoque
```

### 🧪 **Como Testar a Função:**

```sql
-- 1. Primeiro, execute toda a migração SQL no Supabase
-- 2. Depois teste chamando a função:

-- Exemplo de chamada da função (substitua pelos IDs reais):
SELECT desligar_aluno(
  'uuid-do-aluno',      -- ID do aluno
  'uuid-do-usuario',    -- ID do usuário que está desligando
  'Motivo opcional'     -- Motivo do desligamento
);

-- Para verificar se funcionou:
-- Verificar se aluno ficou inativo
SELECT id, nome_completo, ativo, data_desligamento FROM alunos WHERE id = 'uuid-do-aluno';

-- Verificar se armação foi liberada (se existia)
SELECT id, numeracao, status FROM armacoes WHERE status = 'disponivel' ORDER BY updated_at DESC LIMIT 5;
```

### 🔧 **Solução para Problemas Comuns:**

#### **Erro 406 (Not Acceptable):**
- **Causa:** Nome de coluna `armacão_id` (com acento) sendo acessado incorretamente no frontend
- **Solução:** Corrigido `src/services/armacoes.ts` para usar `'armacão_id'` com aspas duplas

#### **Erro 400 (Bad Request):**
- **Causa:** Problemas de RLS ou permissões insuficientes para função RPC
- **Solução:** Recriadas políticas RLS e corrigida função com `EXECUTE` para nomes especiais

#### **Correções Específicas Aplicadas:**
- ✅ **Frontend:** Substituído acesso direto por funções RPC
- ✅ **Backend:** Criadas funções `get_current_armacao_for_aluno()` e `release_current_armacao_for_aluno()`
- ✅ **Coluna com acento:** Problema resolvido via RPC functions
- ✅ **RLS:** Políticas permissivas recriadas para operações de alunos inativos
- ✅ **Logs:** Melhor tratamento de erro com `RAISE NOTICE` para debug
- ✅ **Migração:** `20260116000000_verify_and_fix_column_names.sql` criada

#### **Teste Passo-a-Passo:**
```sql
-- 1. Verificar se aluno existe e está ativo
SELECT id, nome_completo, ativo FROM alunos WHERE id = 'uuid-do-aluno';

-- 2. Verificar se tem armação vinculada
SELECT get_current_armacao_for_aluno('uuid-do-aluno');

-- 3. Chamar a função
SELECT desligar_aluno('uuid-do-aluno', 'uuid-do-usuario', 'Teste');

-- 4. Verificar resultados
SELECT id, ativo, data_desligamento FROM alunos WHERE id = 'uuid-do-aluno';
SELECT id, status FROM armacoes WHERE status = 'disponivel';
```

### 🎯 **Solução Final Implementada:**

#### **Problema Identificado:**
- Coluna `armacão_id` (com acento) causava erros 406/400 no Supabase REST API
- Acesso direto via frontend falhava devido ao nome especial da coluna

#### **Solução Implementada:**
- **Funções RPC:** Criadas funções no banco para acesso seguro
- **Frontend Simplificado:** Substituído queries complexas por chamadas RPC
- **Backend Seguro:** Lógica de negócio movida para PL/pgSQL
- **Compatibilidade:** Funciona independente do nome da coluna

#### **Arquivos Modificados:**
- ✅ `src/services/armacoes.ts` - Funções simplificadas
- ✅ `supabase/migrations/20260116000000_verify_and_fix_column_names.sql` - RPC functions
- ✅ Documentação atualizada com solução final

### 3. **Filtros por Status**

```sql
-- Ativos
SELECT * FROM alunos WHERE ativo = true;

-- Inativos
SELECT * FROM alunos WHERE ativo = false;

-- Desligados por um usuário específico
SELECT * FROM alunos
WHERE ativo = false AND desligado_por = 'user-uuid';

-- Desligados em um período
SELECT * FROM alunos
WHERE ativo = false
AND data_desligamento BETWEEN '2024-01-01' AND '2024-12-31';
```

## 🔧 Implementação no Sistema

### 1. **Hooks Atualizados**

Modificar `use-alunos.ts`:

```typescript
// Hook para alunos ativos (padrão)
export function useAlunos(ativosOnly = true) {
  return useQuery({
    queryKey: ['alunos', ativosOnly ? 'ativos' : 'todos'],
    queryFn: () => ativosOnly
      ? alunosService.getAlunosAtivos()
      : alunosService.getTodosAlunos()
  });
}

// Novo hook para alunos inativos
export function useAlunosInativos() {
  return useQuery({
    queryKey: ['alunos', 'inativos'],
    queryFn: () => alunosService.getAlunosInativos()
  });
}
```

### 2. **Serviços Atualizados**

Adicionar métodos em `alunos.ts`:

```typescript
export const alunosService = {
  // ... métodos existentes

  // Relatórios - apenas alunos ativos
  async getAlunosParaRelatorios() {
    const { data, error } = await supabase
      .from('alunos_relatorios')
      .select('*');

    if (error) throw error;
    return data;
  },

  // Novos métodos para gestão de inativos
  async desligar(alunoId: string, motivo?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .rpc('desligar_aluno', {
        aluno_id: alunoId,
        user_id: user.id,
        motivo
      });

    if (error) throw error;
  },

  async reativar(alunoId: string) {
    const { error } = await supabase
      .rpc('reativar_aluno', { aluno_id: alunoId });

    if (error) throw error;
  },

  async getAlunosInativos() {
    const { data, error } = await supabase
      .from('alunos_inativos')
      .select('*')
      .order('data_desligamento', { ascending: false });

    if (error) throw error;
    return data;
  }
};
```

### 3. **UI - Modal de Alunos Inativos**

Os alunos inativos são acessados através de um botão na página de Alunos:

```typescript
// Na página AlunosPage.tsx
<Button
  variant="outline"
  onClick={() => setShowInativosModal(true)}
  className="gap-2"
>
  <UserX className="h-4 w-4" />
  Alunos Inativos
  {alunosInativos.length > 0 && (
    <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
      {alunosInativos.length}
    </Badge>
  )}
</Button>

// Modal integrado na mesma página
<Dialog open={showInativosModal} onOpenChange={setShowInativosModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <UserX className="w-5 h-5" />
        Alunos Inativos
        <Badge variant="destructive">{alunosInativos.length}</Badge>
      </DialogTitle>
    </DialogHeader>

    {/* Lista de alunos inativos com botão reativar */}
  </DialogContent>
</Dialog>
```

### 4. **Comportamento das Armações**

#### **Quando um Aluno é Desligado:**
- 🔄 **Armação Vinculada**: É automaticamente liberada e volta ao estoque
- 📝 **Histórico**: Registro de vinculação é removido
- ✅ **Disponibilidade**: Armação fica disponível para outros alunos

#### **Quando um Aluno é Reativado:**
- ⚠️ **Armação**: Não é automaticamente reatribuída
- 🔄 **Processo**: Novo processo de seleção deve ser feito
- 📋 **Manual**: Reativação não inclui reatribuição automática

### 5. **Relatórios - Usar Apenas Alunos Ativos**

**ATENÇÃO**: Todos os relatórios foram atualizados para usar a view `alunos_relatorios` que contém apenas alunos ativos. Alunos inativos NÃO aparecem nos relatórios.

```typescript
// ✅ CORRETO: Relatórios usam apenas alunos ativos
export const relatoriosService = {
  async getAlunosPorFase() {
    const { data, error } = await supabase
      .from('alunos_relatorios') // ✅ Apenas ativos
      .select('fase_atual')
      .order('fase_atual');

    if (error) throw error;
    return data;
  },

  async getAlunosPorMunicipio() {
    const { data, error } = await supabase
      .from('alunos_relatorios') // ✅ Apenas ativos
      .select(`
        municipio_id,
        municipios (nome, estado)
      `);

    if (error) throw error;
    return data;
  }
};

// ❌ ERRADO: NÃO usar esta query em relatórios
// const { data } = await supabase.from('alunos').select('*');
// // Isso incluiria alunos inativos!
```

### 5. **Modal de Desligamento Implementado**

```typescript
// DesligarAlunoDialog.tsx - modal convertido de exclusão para desligamento
export function DesligarAlunoDialog({ open, onOpenChange, aluno }) {
  const [motivo, setMotivo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDesligar = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.rpc('desligar_aluno', {
        aluno_id: aluno.id,
        user_id: user.id,
        motivo: motivo.trim() || null
      });

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Aluno desligado!' });
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao desligar aluno', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTitle>Desligar Aluno</AlertDialogTitle>
      <AlertDialogDescription>
        O aluno <strong>{aluno.nomeCompleto}</strong> será marcado como inativo.
        Todos os dados serão preservados e o aluno poderá ser reativado posteriormente.
      </AlertDialogDescription>

      <div className="space-y-4 py-4">
        <Label>Motivo do Desligamento (Opcional)</Label>
        <Textarea
          placeholder="Descreva o motivo..."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={handleDesligar}
          disabled={isLoading}
          className="bg-amber-600 text-white hover:bg-amber-700"
        >
          {isLoading ? 'Desligando...' : 'Desligar Aluno'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialog>
  );
}
```

## 📊 Relatórios e Analytics

### ⚠️ **IMPORTANTE**: Relatórios usam apenas alunos ativos

Todos os relatórios devem usar a view `alunos_relatorios` ou filtrar `WHERE ativo = true` para garantir que apenas alunos ativos sejam incluídos nas análises.

### Consultas para Relatórios (Apenas Ativos):

```sql
-- Relatório de alunos por fase (apenas ativos)
SELECT
  fase_atual,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentual
FROM alunos_relatorios
GROUP BY fase_atual
ORDER BY total DESC;

-- Relatório por município (apenas ativos)
SELECT
  m.nome as municipio,
  m.estado,
  COUNT(a.id) as total_alunos
FROM alunos_relatorios a
JOIN municipios m ON a.municipio_id = m.id
GROUP BY m.id, m.nome, m.estado
ORDER BY total_alunos DESC;
```

### Consultas para Gestão de Inativos:

```sql
-- Estatísticas de desligamentos por mês
SELECT
  DATE_TRUNC('month', data_desligamento) as mes,
  COUNT(*) as total_desligados,
  STRING_AGG(DISTINCT motivo_desligamento, '; ') as motivos
FROM alunos
WHERE ativo = false AND data_desligamento IS NOT NULL
GROUP BY DATE_TRUNC('month', data_desligamento)
ORDER BY mes DESC;

-- Top usuários que mais desligaram alunos
SELECT
  u.email,
  COUNT(*) as total_desligamentos
FROM alunos a
JOIN auth.users u ON a.desligado_por = u.id
WHERE a.ativo = false
GROUP BY u.id, u.email
ORDER BY total_desligamentos DESC;
```

## 🔐 Segurança e RLS

As políticas RLS existentes devem ser atualizadas para considerar o campo `ativo`:

```sql
-- Exemplo: usuários só veem alunos ativos por padrão
CREATE POLICY "users_select_active_alunos" ON alunos
FOR SELECT USING (ativo = true OR auth.uid() = desligado_por);

-- Admin pode ver todos
CREATE POLICY "admin_select_all_alunos" ON alunos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

## 📋 Checklist de Implementação

- [ ] Executar migração SQL
- [ ] Atualizar hooks para incluir parâmetro `ativosOnly`
- [ ] Criar hook `useAlunosInativos`
- [ ] Atualizar serviços com métodos `desligar` e `reativar`
- [ ] **CRÍTICO**: Atualizar TODOS os relatórios para usar `alunos_relatorios`
- [x] **CRÍTICO**: Atualizar serviço de relatórios (src/services/relatorios.ts)
- [x] **CRÍTICO**: Atualizar dashboard (src/services/dashboard.ts)
- [x] **FEITO**: Modal de exclusão convertido para "desligar" com campo de motivo
- [x] **FEITO**: Criar modal de Alunos Inativos integrado na página de Alunos
- [x] **FEITO**: Remover item separado de navegação (integrado em Alunos)
- [ ] Testar reativação de alunos
- [ ] Verificar permissões RLS
- [ ] **CRÍTICO**: Verificar que relatórios NÃO incluem alunos inativos
- [ ] **CRÍTICO**: Verificar que armações são liberadas quando alunos são desligados

## 🎯 Benefícios

1. **Auditoria**: Rastreamento completo de ações
2. **Compliance**: Dados preservados para auditorias
3. **Flexibilidade**: Possibilidade de reverter ações
4. **Analytics**: Métricas focadas em alunos ativos
5. **Relatórios**: Análises precisas sem alunos inativos
6. **Gestão de Armações**: Liberação automática ao desligar
7. **Performance**: Consultas otimizadas com índices
8. **Usabilidade**: Interface clara para gerenciar status

---

**Data da Implementação:** Janeiro 2025
**Versão:** 1.0
**Responsável:** Sistema Ver e Ler