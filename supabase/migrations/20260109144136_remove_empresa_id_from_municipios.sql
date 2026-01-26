-- =============================================
-- MIGRAÇÃO: REMOVER empresa_id DA TABELA municipios
-- =============================================
-- Esta migração remove a dependência de empresa_id da tabela municipios
-- para permitir que municípios sejam usados em múltiplos projetos

-- Remover o índice relacionado
DROP INDEX IF EXISTS idx_municipios_empresa;

-- Remover a foreign key constraint
ALTER TABLE public.municipios 
  DROP CONSTRAINT IF EXISTS municipios_empresa_id_fkey;

-- Remover a coluna empresa_id
ALTER TABLE public.municipios 
  DROP COLUMN IF EXISTS empresa_id;
