-- =============================================
-- AUDITORIA: Movimentações/alterações de armações (Estoque)
-- =============================================
-- Objetivo: registrar quem alterou status/tamanho da armação (inclui ação de "Saída").

CREATE TABLE IF NOT EXISTS public.armacoes_movimentacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  armacao_id UUID NOT NULL REFERENCES public.armacoes(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acao TEXT NOT NULL, -- ex: 'alteracao', 'saida'
  campo TEXT NOT NULL, -- ex: 'status', 'tamanho'
  valor_anterior TEXT,
  valor_novo TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_armacoes_mov_armacao ON public.armacoes_movimentacoes(armacao_id);
CREATE INDEX IF NOT EXISTS idx_armacoes_mov_usuario ON public.armacoes_movimentacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_armacoes_mov_created_at ON public.armacoes_movimentacoes(created_at);

ALTER TABLE public.armacoes_movimentacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view armacoes_movimentacoes" ON public.armacoes_movimentacoes;
CREATE POLICY "Authenticated users can view armacoes_movimentacoes"
  ON public.armacoes_movimentacoes FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert armacoes_movimentacoes" ON public.armacoes_movimentacoes;
CREATE POLICY "Authenticated users can insert armacoes_movimentacoes"
  ON public.armacoes_movimentacoes FOR INSERT
  TO authenticated
  WITH CHECK (true);
