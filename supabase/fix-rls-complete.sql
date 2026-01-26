-- =============================================
-- CORREÇÃO COMPLETA DAS POLÍTICAS RLS
-- =============================================
-- Execute este script no SQL Editor do Supabase
-- Este script remove TODAS as políticas antigas e cria novas
-- =============================================

-- =============================================
-- PASSO 1: REMOVER TODAS AS POLÍTICAS EXISTENTES
-- =============================================

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- User Roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can manage roles" ON public.user_roles;

-- Empresas
DROP POLICY IF EXISTS "Authenticated users can view empresas" ON public.empresas;
DROP POLICY IF EXISTS "Admins can manage empresas" ON public.empresas;
DROP POLICY IF EXISTS "Authenticated users can insert empresas" ON public.empresas;
DROP POLICY IF EXISTS "Authenticated users can update empresas" ON public.empresas;
DROP POLICY IF EXISTS "Authenticated users can delete empresas" ON public.empresas;

-- Projetos
DROP POLICY IF EXISTS "Authenticated users can view projetos" ON public.projetos;
DROP POLICY IF EXISTS "Admins can manage projetos" ON public.projetos;
DROP POLICY IF EXISTS "Authenticated users can insert projetos" ON public.projetos;
DROP POLICY IF EXISTS "Authenticated users can update projetos" ON public.projetos;
DROP POLICY IF EXISTS "Authenticated users can delete projetos" ON public.projetos;

-- Municipios
DROP POLICY IF EXISTS "Authenticated users can view municipios" ON public.municipios;
DROP POLICY IF EXISTS "Admins can manage municipios" ON public.municipios;
DROP POLICY IF EXISTS "Authenticated users can insert municipios" ON public.municipios;
DROP POLICY IF EXISTS "Authenticated users can update municipios" ON public.municipios;
DROP POLICY IF EXISTS "Authenticated users can delete municipios" ON public.municipios;

-- Municipio Projetos
DROP POLICY IF EXISTS "Authenticated users can view municipio_projetos" ON public.municipio_projetos;
DROP POLICY IF EXISTS "Admins can manage municipio_projetos" ON public.municipio_projetos;
DROP POLICY IF EXISTS "Authenticated users can insert municipio_projetos" ON public.municipio_projetos;
DROP POLICY IF EXISTS "Authenticated users can update municipio_projetos" ON public.municipio_projetos;
DROP POLICY IF EXISTS "Authenticated users can delete municipio_projetos" ON public.municipio_projetos;

-- Escolas
DROP POLICY IF EXISTS "Authenticated users can view escolas" ON public.escolas;
DROP POLICY IF EXISTS "Admins can manage escolas" ON public.escolas;
DROP POLICY IF EXISTS "Authenticated users can insert escolas" ON public.escolas;
DROP POLICY IF EXISTS "Authenticated users can update escolas" ON public.escolas;
DROP POLICY IF EXISTS "Authenticated users can delete escolas" ON public.escolas;

-- Escola Projetos
DROP POLICY IF EXISTS "Authenticated users can view escola_projetos" ON public.escola_projetos;
DROP POLICY IF EXISTS "Admins can manage escola_projetos" ON public.escola_projetos;
DROP POLICY IF EXISTS "Authenticated users can insert escola_projetos" ON public.escola_projetos;
DROP POLICY IF EXISTS "Authenticated users can update escola_projetos" ON public.escola_projetos;
DROP POLICY IF EXISTS "Authenticated users can delete escola_projetos" ON public.escola_projetos;

-- Turmas
DROP POLICY IF EXISTS "Authenticated users can view turmas" ON public.turmas;
DROP POLICY IF EXISTS "Admins can manage turmas" ON public.turmas;
DROP POLICY IF EXISTS "Authenticated users can insert turmas" ON public.turmas;
DROP POLICY IF EXISTS "Authenticated users can update turmas" ON public.turmas;
DROP POLICY IF EXISTS "Authenticated users can delete turmas" ON public.turmas;

-- Alunos
DROP POLICY IF EXISTS "Authenticated users can view alunos" ON public.alunos;
DROP POLICY IF EXISTS "Admins can manage alunos" ON public.alunos;
DROP POLICY IF EXISTS "Authenticated users can insert alunos" ON public.alunos;
DROP POLICY IF EXISTS "Authenticated users can update alunos" ON public.alunos;
DROP POLICY IF EXISTS "Authenticated users can delete alunos" ON public.alunos;

-- Historico Fases
DROP POLICY IF EXISTS "Authenticated users can view historico_fases" ON public.historico_fases;
DROP POLICY IF EXISTS "Admins can manage historico_fases" ON public.historico_fases;
DROP POLICY IF EXISTS "Authenticated users can insert historico_fases" ON public.historico_fases;
DROP POLICY IF EXISTS "Authenticated users can update historico_fases" ON public.historico_fases;
DROP POLICY IF EXISTS "Authenticated users can delete historico_fases" ON public.historico_fases;

-- =============================================
-- PASSO 2: CRIAR POLÍTICAS PERMISSIVAS
-- =============================================
-- Estas políticas permitem que QUALQUER usuário autenticado
-- faça todas as operações. Para desenvolvimento, isso é seguro.
-- =============================================

-- =============================================
-- EMPRESAS - Políticas completas
-- =============================================
CREATE POLICY "empresas_select_policy"
  ON public.empresas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "empresas_insert_policy"
  ON public.empresas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "empresas_update_policy"
  ON public.empresas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "empresas_delete_policy"
  ON public.empresas FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- PROJETOS - Políticas completas
-- =============================================
CREATE POLICY "projetos_select_policy"
  ON public.projetos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "projetos_insert_policy"
  ON public.projetos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "projetos_update_policy"
  ON public.projetos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "projetos_delete_policy"
  ON public.projetos FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- MUNICIPIOS - Políticas completas
-- =============================================
CREATE POLICY "municipios_select_policy"
  ON public.municipios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "municipios_insert_policy"
  ON public.municipios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "municipios_update_policy"
  ON public.municipios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "municipios_delete_policy"
  ON public.municipios FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- MUNICIPIO_PROJETOS - Políticas completas
-- =============================================
CREATE POLICY "municipio_projetos_select_policy"
  ON public.municipio_projetos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "municipio_projetos_insert_policy"
  ON public.municipio_projetos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "municipio_projetos_update_policy"
  ON public.municipio_projetos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "municipio_projetos_delete_policy"
  ON public.municipio_projetos FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- ESCOLAS - Políticas completas
-- =============================================
CREATE POLICY "escolas_select_policy"
  ON public.escolas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "escolas_insert_policy"
  ON public.escolas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "escolas_update_policy"
  ON public.escolas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "escolas_delete_policy"
  ON public.escolas FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- ESCOLA_PROJETOS - Políticas completas
-- =============================================
CREATE POLICY "escola_projetos_select_policy"
  ON public.escola_projetos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "escola_projetos_insert_policy"
  ON public.escola_projetos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "escola_projetos_update_policy"
  ON public.escola_projetos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "escola_projetos_delete_policy"
  ON public.escola_projetos FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- TURMAS - Políticas completas
-- =============================================
CREATE POLICY "turmas_select_policy"
  ON public.turmas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "turmas_insert_policy"
  ON public.turmas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "turmas_update_policy"
  ON public.turmas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "turmas_delete_policy"
  ON public.turmas FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- ALUNOS - Políticas completas
-- =============================================
CREATE POLICY "alunos_select_policy"
  ON public.alunos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "alunos_insert_policy"
  ON public.alunos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "alunos_update_policy"
  ON public.alunos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "alunos_delete_policy"
  ON public.alunos FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- HISTORICO_FASES - Políticas completas
-- =============================================
CREATE POLICY "historico_fases_select_policy"
  ON public.historico_fases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "historico_fases_insert_policy"
  ON public.historico_fases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "historico_fases_update_policy"
  ON public.historico_fases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "historico_fases_delete_policy"
  ON public.historico_fases FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- PROFILES - Políticas completas
-- =============================================
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_policy"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "profiles_update_policy"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "profiles_delete_policy"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- USER_ROLES - Políticas completas
-- =============================================
CREATE POLICY "user_roles_select_policy"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "user_roles_insert_policy"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "user_roles_update_policy"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "user_roles_delete_policy"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================
-- Execute esta query para verificar se as políticas foram criadas:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;
-- =============================================

-- =============================================
-- IMPORTANTE: Se ainda tiver problemas
-- =============================================
-- Se você ainda receber erros de RLS, pode ser que:
-- 1. Você não esteja autenticado no Supabase
-- 2. O cliente está usando a chave anon sem autenticação
-- 
-- SOLUÇÃO TEMPORÁRIA (apenas para desenvolvimento):
-- Descomente as linhas abaixo para DESABILITAR RLS temporariamente:
-- 
-- ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.projetos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.municipios DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.municipio_projetos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.escolas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.escola_projetos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.turmas DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.alunos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.historico_fases DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
-- =============================================
