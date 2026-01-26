-- =============================================
-- CORREÇÃO COMPLETA DAS POLÍTICAS RLS
-- =============================================
-- Execute este script para corrigir as políticas RLS
-- e permitir que usuários autenticados possam criar, visualizar, atualizar e deletar dados
-- =============================================

-- =============================================
-- EMPRESAS - Políticas completas
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view empresas" ON public.empresas;
DROP POLICY IF EXISTS "Authenticated users can insert empresas" ON public.empresas;
DROP POLICY IF EXISTS "Authenticated users can update empresas" ON public.empresas;
DROP POLICY IF EXISTS "Authenticated users can delete empresas" ON public.empresas;
DROP POLICY IF EXISTS "Admins can manage empresas" ON public.empresas;

CREATE POLICY "Authenticated users can view empresas"
  ON public.empresas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert empresas"
  ON public.empresas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update empresas"
  ON public.empresas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete empresas"
  ON public.empresas FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- PROJETOS - Políticas completas
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view projetos" ON public.projetos;
DROP POLICY IF EXISTS "Authenticated users can insert projetos" ON public.projetos;
DROP POLICY IF EXISTS "Authenticated users can update projetos" ON public.projetos;
DROP POLICY IF EXISTS "Authenticated users can delete projetos" ON public.projetos;
DROP POLICY IF EXISTS "Admins can manage projetos" ON public.projetos;

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
-- MUNICÍPIOS - Políticas completas
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view municipios" ON public.municipios;
DROP POLICY IF EXISTS "Authenticated users can insert municipios" ON public.municipios;
DROP POLICY IF EXISTS "Authenticated users can update municipios" ON public.municipios;
DROP POLICY IF EXISTS "Authenticated users can delete municipios" ON public.municipios;
DROP POLICY IF EXISTS "Admins can manage municipios" ON public.municipios;

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
-- MUNICIPIO_PROJETOS - Políticas completas
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view municipio_projetos" ON public.municipio_projetos;
DROP POLICY IF EXISTS "Authenticated users can insert municipio_projetos" ON public.municipio_projetos;
DROP POLICY IF EXISTS "Authenticated users can update municipio_projetos" ON public.municipio_projetos;
DROP POLICY IF EXISTS "Authenticated users can delete municipio_projetos" ON public.municipio_projetos;
DROP POLICY IF EXISTS "Admins can manage municipio_projetos" ON public.municipio_projetos;

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
-- ESCOLAS - Políticas completas
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view escolas" ON public.escolas;
DROP POLICY IF EXISTS "Authenticated users can insert escolas" ON public.escolas;
DROP POLICY IF EXISTS "Authenticated users can update escolas" ON public.escolas;
DROP POLICY IF EXISTS "Authenticated users can delete escolas" ON public.escolas;
DROP POLICY IF EXISTS "Admins can manage escolas" ON public.escolas;

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
-- ESCOLA_PROJETOS - Políticas completas
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view escola_projetos" ON public.escola_projetos;
DROP POLICY IF EXISTS "Authenticated users can insert escola_projetos" ON public.escola_projetos;
DROP POLICY IF EXISTS "Authenticated users can update escola_projetos" ON public.escola_projetos;
DROP POLICY IF EXISTS "Authenticated users can delete escola_projetos" ON public.escola_projetos;
DROP POLICY IF EXISTS "Admins can manage escola_projetos" ON public.escola_projetos;

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
-- TURMAS - Políticas completas
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view turmas" ON public.turmas;
DROP POLICY IF EXISTS "Authenticated users can insert turmas" ON public.turmas;
DROP POLICY IF EXISTS "Authenticated users can update turmas" ON public.turmas;
DROP POLICY IF EXISTS "Authenticated users can delete turmas" ON public.turmas;
DROP POLICY IF EXISTS "Admins can manage turmas" ON public.turmas;

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
-- ALUNOS - Políticas completas
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view alunos" ON public.alunos;
DROP POLICY IF EXISTS "Authenticated users can insert alunos" ON public.alunos;
DROP POLICY IF EXISTS "Authenticated users can update alunos" ON public.alunos;
DROP POLICY IF EXISTS "Authenticated users can delete alunos" ON public.alunos;
DROP POLICY IF EXISTS "Admins can manage alunos" ON public.alunos;

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
-- HISTORICO_FASES - Políticas completas
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view historico_fases" ON public.historico_fases;
DROP POLICY IF EXISTS "Authenticated users can insert historico_fases" ON public.historico_fases;
DROP POLICY IF EXISTS "Authenticated users can update historico_fases" ON public.historico_fases;
DROP POLICY IF EXISTS "Authenticated users can delete historico_fases" ON public.historico_fases;
DROP POLICY IF EXISTS "Admins can manage historico_fases" ON public.historico_fases;

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
-- PROFILES - Políticas completas
-- =============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FIM DO SCRIPT
-- =============================================
-- ✅ Políticas RLS corrigidas com sucesso!
-- Agora usuários autenticados podem criar, visualizar, atualizar e deletar dados
-- =============================================
