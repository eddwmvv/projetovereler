# 🚀 Configuração do Supabase - Sistema Ver e Ler

## 📋 Passo a Passo

### 1. Criar o Banco de Dados no Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto (ou crie um novo)
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Copie TODO o conteúdo do arquivo `supabase/database-setup.sql`
6. Cole no editor SQL
7. Clique em **Run** (ou pressione `Ctrl+Enter`)

✅ O banco de dados será criado com todas as tabelas, relacionamentos, índices e políticas RLS!

---

### 2. Obter as Credenciais do Supabase

1. No Supabase Dashboard, vá em **Settings** > **API**
2. Você encontrará:
   - **Project URL** → será sua `VITE_SUPABASE_URL`
   - **anon/public key** → será sua `VITE_SUPABASE_PUBLISHABLE_KEY`

---

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica-aqui
```

⚠️ **IMPORTANTE**: 
- O arquivo `.env` não deve ser commitado no Git (já deve estar no `.gitignore`)
- Use `.env.local` para desenvolvimento local se preferir

---

### 4. Verificar a Conexão

O cliente Supabase já está configurado em `src/integrations/supabase/client.ts`.

Para testar a conexão, você pode usar:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Testar conexão
const { data, error } = await supabase.from('empresas').select('*');
console.log(data, error);
```

---

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas:

- ✅ `empresas` - Entidades executoras
- ✅ `projetos` - Projetos vinculados às empresas
- ✅ `municipios` - Municípios atendidos
- ✅ `municipio_projetos` - Relacionamento N:N
- ✅ `escolas` - Escolas dos municípios
- ✅ `escola_projetos` - Relacionamento N:N
- ✅ `turmas` - Turmas das escolas
- ✅ `alunos` - Alunos cadastrados
- ✅ `historico_fases` - Histórico de fases do aluno
- ✅ `profiles` - Perfis de usuários
- ✅ `user_roles` - Controle de papéis (admin/moderator/user)

### Recursos Incluídos:

✅ **ENUMs** para status, fases, turnos e gêneros  
✅ **RLS (Row Level Security)** em todas as tabelas  
✅ **Índices** para performance otimizada  
✅ **Triggers** para updated_at automático  
✅ **Auto-criação de profile** no signup  
✅ **Sistema de roles** com função `has_role()`  
✅ **Auto-confirm de email** habilitado (configurar no Supabase Dashboard)

---

## 🔐 Segurança (RLS)

As políticas RLS estão configuradas para:

- **Usuários autenticados**: Podem visualizar todos os dados
- **Admins**: Podem gerenciar (criar, editar, deletar) todos os dados
- **Usuários comuns**: Podem apenas visualizar

Para atribuir role de admin a um usuário:

```sql
-- No SQL Editor do Supabase
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = 'uuid-do-usuario';
```

---

## 🆘 Problemas Comuns

### Erro: "relation already exists"
- Algumas tabelas já existem. Você pode:
  1. Deletar as tabelas existentes manualmente
  2. Ou usar `DROP TABLE IF EXISTS` antes de criar

### Erro: "permission denied"
- Verifique se está executando como superuser no SQL Editor
- Algumas funções requerem privilégios elevados

### Não consigo conectar
- Verifique se as variáveis de ambiente estão corretas
- Verifique se o projeto Supabase está ativo
- Verifique se a chave pública está correta

---

## 📝 Próximos Passos

Após configurar o banco:

1. ✅ Testar a conexão
2. ✅ Criar um usuário de teste
3. ✅ Popular o banco com dados iniciais (opcional)
4. ✅ Configurar autenticação no frontend

---

**Dúvidas?** Consulte a [documentação do Supabase](https://supabase.com/docs)
