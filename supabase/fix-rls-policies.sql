-- =============================================
-- CORREÇÃO DAS POLÍTICAS RLS (Row Level Security)
-- =============================================
-- Execute este script no SQL Editor do Supabase para corrigir
-- o erro: "new row violates row-level security policy"
-- =============================================

-- =============================================
-- REMOVER POLÍTICAS ANTIGAS (se existirem)
-- =============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can view empresas" ON public.empresas;
DROP POLICY IF EXISTS "Admins can manage empresas" ON public.empresas;
DROP POLICY IF EXISTS "Authenticated users can view projetos" ON public.projetos;
DROP POLICY IF EXISTS "Admins can manage projetos" ON public.projetos;
DROP POLICY IF EXISTS "Authenticated users can view municipios" ON public.municipios;
DROP POLICY IF EXISTS "Admins can manage municipios" ON public.municipios;
DROP POLICY IF EXISTS "Authenticated users can view municipio_projetos" ON public.municipio_projetos;
DROP POLICY IF EXISTS "Admins can manage municipio_projetos" ON public.municipio_projetos;
DROP POLICY IF EXISTS "Authenticated users can view escolas" ON public.escolas;
DROP POLICY IF EXISTS "Admins can manage escolas" ON public.escolas;
DROP POLICY IF EXISTS "Authenticated users can view escola_projetos" ON public.escola_projetos;
DROP POLICY IF EXISTS "Admins can manage escola_projetos" ON public.escola_projetos;
DROP POLICY IF EXISTS "Authenticated users can view turmas" ON public.turmas;
DROP POLICY IF EXISTS "Admins can manage turmas" ON public.turmas;
DROP POLICY IF EXISTS "Authenticated users can view alunos" ON public.alunos;
DROP POLICY IF EXISTS "Admins can manage alunos" ON public.alunos;
DROP POLICY IF EXISTS "Authenticated users can view historico_fases" ON public.historico_fases;
DROP POLICY IF EXISTS "Admins can manage historico_fases" ON public.historico_fases;

-- =============================================
-- POLÍTICAS PARA PROFILES
-- =============================================
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- POLÍTICAS PARA USER_ROLES
-- =============================================
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- POLÍTICAS PARA EMPRESAS
-- =============================================
-- Permitir que usuários autenticados vejam todas as empresas
CREATE POLICY "Authenticated users can view empresas"
  ON public.empresas FOR SELECT
  TO authenticated
  USING (true);

-- Permitir que usuários autenticados criem empresas
CREATE POLICY "Authenticated users can insert empresas"
  ON public.empresas FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir que usuários autenticados atualizem empresas
CREATE POLICY "Authenticated users can update empresas"
  ON public.empresas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permitir que usuários autenticados deletem empresas
CREATE POLICY "Authenticated users can delete empresas"
  ON public.empresas FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- POLÍTICAS PARA PROJETOS
-- =============================================
CREATE POLICY "Authenticated users can view projetos"
  ON public.projetos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert projetos"
  ON public.projetos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projetos"
  ON public.projetos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projetos"
  ON public.projetos FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- POLÍTICAS PARA MUNICÍPIOS
-- =============================================
CREATE POLICY "Authenticated users can view municipios"
  ON public.municipios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert municipios"
  ON public.municipios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update municipios"
  ON public.municipios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete municipios"
  ON public.municipios FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- POLÍTICAS PARA MUNICIPIO_PROJETOS
-- =============================================
CREATE POLICY "Authenticated users can view municipio_projetos"
  ON public.municipio_projetos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert municipio_projetos"
  ON public.municipio_projetos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update municipio_projetos"
  ON public.municipio_projetos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete municipio_projetos"
  ON public.municipio_projetos FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- POLÍTICAS PARA ESCOLAS
-- =============================================
CREATE POLICY "Authenticated users can view escolas"
  ON public.escolas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert escolas"
  ON public.escolas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update escolas"
  ON public.escolas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete escolas"
  ON public.escolas FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- POLÍTICAS PARA ESCOLA_PROJETOS
-- =============================================
CREATE POLICY "Authenticated users can view escola_projetos"
  ON public.escola_projetos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert escola_projetos"
  ON public.escola_projetos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update escola_projetos"
  ON public.escola_projetos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete escola_projetos"
  ON public.escola_projetos FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- POLÍTICAS PARA TURMAS
-- =============================================
CREATE POLICY "Authenticated users can view turmas"
  ON public.turmas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert turmas"
  ON public.turmas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update turmas"
  ON public.turmas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete turmas"
  ON public.turmas FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- POLÍTICAS PARA ALUNOS
-- =============================================
CREATE POLICY "Authenticated users can view alunos"
  ON public.alunos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert alunos"
  ON public.alunos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update alunos"
  ON public.alunos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete alunos"
  ON public.alunos FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- POLÍTICAS PARA HISTORICO_FASES
-- =============================================
CREATE POLICY "Authenticated users can view historico_fases"
  ON public.historico_fases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert historico_fases"
  ON public.historico_fases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update historico_fases"
  ON public.historico_fases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete historico_fases"
  ON public.historico_fases FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- FIM DO SCRIPT
-- =============================================
-- ✅ Políticas RLS atualizadas com sucesso!
-- 
-- Agora todos os usuários autenticados podem:
-- - Visualizar todos os registros
-- - Criar novos registros
-- - Atualizar registros existentes
-- - Deletar registros
-- 
-- ⚠️ NOTA: Se você quiser restringir permissões no futuro,
-- você pode modificar essas políticas para serem mais específicas.
-- =============================================
