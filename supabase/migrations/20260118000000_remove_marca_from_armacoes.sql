-- =============================================
-- REMOVER CAMPO MARCA DA TABELA ARMACOES
-- =============================================
-- Remoção do campo marca que não será mais utilizado
-- =============================================

-- =============================================
-- REMOVER COLUNA MARCA DA TABELA ARMACOES
-- =============================================
ALTER TABLE public.armacoes
DROP COLUMN IF EXISTS marca;

-- =============================================
-- FIM DA MIGRAÇÃO
-- =============================================