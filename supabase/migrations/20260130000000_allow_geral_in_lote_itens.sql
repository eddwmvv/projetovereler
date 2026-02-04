-- =============================================
-- AJUSTE: Permitir opção "Geral" (tamanho_id NULL) em lote_itens
-- =============================================
-- Objetivo: possibilitar registrar quantidade total do lote sem precisar escolher um tamanho.
-- Rodar no Supabase (migração) ou via SQL Editor.

DO $$
BEGIN
  -- Se a coluna tamanho_id estiver marcada como NOT NULL, removemos a restrição.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'lote_itens'
      AND column_name = 'tamanho_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.lote_itens
      ALTER COLUMN tamanho_id DROP NOT NULL;

    RAISE NOTICE 'tamanho_id agora permite NULL (opção Geral)';
  ELSE
    RAISE NOTICE 'tamanho_id já permite NULL (nenhuma alteração necessária)';
  END IF;
END $$;
