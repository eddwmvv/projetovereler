-- =============================================
-- POLÍTICAS RLS PARA ARMAÇÕES E HISTÓRICO
-- =============================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.armacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.armacoes_historico ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ARMAÇÕES - Políticas completas
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view armacoes" ON public.armacoes;
DROP POLICY IF EXISTS "Authenticated users can insert armacoes" ON public.armacoes;
DROP POLICY IF EXISTS "Authenticated users can update armacoes" ON public.armacoes;
DROP POLICY IF EXISTS "Authenticated users can delete armacoes" ON public.armacoes;

CREATE POLICY "Authenticated users can view armacoes"
  ON public.armacoes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert armacoes"
  ON public.armacoes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update armacoes"
  ON public.armacoes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete armacoes"
  ON public.armacoes FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- ARMAÇÕES HISTÓRICO - Políticas completas
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view armacoes_historico" ON public.armacoes_historico;
DROP POLICY IF EXISTS "Authenticated users can insert armacoes_historico" ON public.armacoes_historico;
DROP POLICY IF EXISTS "Authenticated users can update armacoes_historico" ON public.armacoes_historico;
DROP POLICY IF EXISTS "Authenticated users can delete armacoes_historico" ON public.armacoes_historico;

CREATE POLICY "Authenticated users can view armacoes_historico"
  ON public.armacoes_historico FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert armacoes_historico"
  ON public.armacoes_historico FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update armacoes_historico"
  ON public.armacoes_historico FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete armacoes_historico"
  ON public.armacoes_historico FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- FIM DO SCRIPT
-- =============================================