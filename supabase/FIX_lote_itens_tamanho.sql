-- =============================================
-- CORREÇÃO: Remover coluna tamanho e usar tamanho_id
-- =============================================
-- Execute este script no SQL Editor do Supabase

-- Passo 1: Verificar se a coluna tamanho existe e removê-la
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'lote_itens' 
    AND column_name = 'tamanho'
  ) THEN
    -- Remover a coluna tamanho antiga
    ALTER TABLE public.lote_itens DROP COLUMN tamanho;
    RAISE NOTICE 'Coluna tamanho removida com sucesso';
  ELSE
    RAISE NOTICE 'Coluna tamanho já não existe';
  END IF;
END $$;

-- Passo 2: Garantir que tamanho_id existe e não é nulo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'lote_itens' 
    AND column_name = 'tamanho_id'
  ) THEN
    -- Adicionar coluna tamanho_id se não existir
    ALTER TABLE public.lote_itens
    ADD COLUMN tamanho_id UUID REFERENCES public.tamanhos(id) ON DELETE RESTRICT;
    RAISE NOTICE 'Coluna tamanho_id adicionada';
  ELSE
    RAISE NOTICE 'Coluna tamanho_id já existe';
  END IF;
END $$;

-- Passo 3: Garantir que o índice existe
CREATE INDEX IF NOT EXISTS idx_lote_itens_tamanho ON public.lote_itens(tamanho_id);

-- =============================================
-- CONCLUÍDO!
-- =============================================
-- A tabela lote_itens agora usa tamanho_id corretamente
-- =============================================
