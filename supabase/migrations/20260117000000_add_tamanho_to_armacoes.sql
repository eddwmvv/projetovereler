-- =============================================
-- ADICIONAR SISTEMA DE TAMANHOS PARA ARMAÇÕES
-- =============================================
-- Migração para criar tabela de tamanhos e adicionar
-- campo tamanho_id à tabela armacoes
-- =============================================

-- =============================================
-- TABELA: TAMANHOS
-- =============================================
CREATE TABLE IF NOT EXISTS public.tamanhos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_tamanhos_updated_at ON public.tamanhos;
CREATE TRIGGER update_tamanhos_updated_at
  BEFORE UPDATE ON public.tamanhos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ADICIONAR CAMPO TAMANHO_ID À TABELA ARMACOES
-- =============================================
ALTER TABLE public.armacoes
ADD COLUMN IF NOT EXISTS tamanho_id UUID REFERENCES public.tamanhos(id) ON DELETE SET NULL;

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_tamanhos_nome ON public.tamanhos(nome);
CREATE INDEX IF NOT EXISTS idx_armacoes_tamanho ON public.armacoes(tamanho_id);

-- =============================================
-- COMENTÁRIOS NAS TABELAS E COLUNAS
-- =============================================
COMMENT ON TABLE public.tamanhos IS 'Tabela de tamanhos disponíveis para armações de óculos';
COMMENT ON COLUMN public.tamanhos.nome IS 'Nome do tamanho (ex: P, M, G, 48, 50, etc.)';
COMMENT ON COLUMN public.tamanhos.descricao IS 'Descrição opcional do tamanho';

COMMENT ON COLUMN public.armacoes.tamanho_id IS 'Referência ao tamanho da armação';

-- =============================================
-- HABILITAR RLS PARA A TABELA TAMANHOS
-- =============================================
ALTER TABLE public.tamanhos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: TAMANHOS
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view tamanhos" ON public.tamanhos;
CREATE POLICY "Authenticated users can view tamanhos"
  ON public.tamanhos FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert tamanhos" ON public.tamanhos;
CREATE POLICY "Authenticated users can insert tamanhos"
  ON public.tamanhos FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update tamanhos" ON public.tamanhos;
CREATE POLICY "Authenticated users can update tamanhos"
  ON public.tamanhos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete tamanhos" ON public.tamanhos;
CREATE POLICY "Authenticated users can delete tamanhos"
  ON public.tamanhos FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- INSERIR ALGUNS TAMANHOS COMUNS
-- =============================================
INSERT INTO public.tamanhos (nome, descricao) VALUES
  ('P', 'Pequeno'),
  ('M', 'Médio'),
  ('G', 'Grande'),
  ('GG', 'Extra Grande'),
  ('48', 'Tamanho 48'),
  ('50', 'Tamanho 50'),
  ('52', 'Tamanho 52'),
  ('54', 'Tamanho 54'),
  ('Infantil', 'Tamanho infantil'),
  ('Adulto', 'Tamanho adulto')
ON CONFLICT (nome) DO NOTHING;

-- =============================================
-- FIM DA MIGRAÇÃO
-- =============================================