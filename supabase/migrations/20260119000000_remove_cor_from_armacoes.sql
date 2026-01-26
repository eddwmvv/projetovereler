-- =============================================
-- REMOVER CAMPO COR DA TABELA ARMACOES
-- =============================================
-- Remoção do campo cor que não será mais utilizado
-- =============================================

-- =============================================
-- REMOVER COLUNA COR DA TABELA ARMACOES
-- =============================================
ALTER TABLE public.armacoes
DROP COLUMN IF EXISTS cor;

-- =============================================
-- FIM DA MIGRAÇÃO
-- =============================================