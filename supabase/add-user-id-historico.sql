-- =============================================
-- ADICIONAR CAMPO USER_ID AO HISTÓRICO DE FASES
-- =============================================
-- Execute este script no SQL Editor do Supabase
-- https://app.supabase.com/project/[seu-projeto]/sql/new
-- =============================================

-- Adicionar coluna user_id para rastrear quem fez a mudança
ALTER TABLE public.historico_fases 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índice para melhor performance em consultas
CREATE INDEX IF NOT EXISTS idx_historico_fases_user_id ON public.historico_fases(user_id);

-- Criar índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_historico_fases_aluno_data ON public.historico_fases(aluno_id, data DESC);

-- Comentário na coluna
COMMENT ON COLUMN public.historico_fases.user_id IS 'Usuário que registrou esta mudança de fase';

-- =============================================
-- VERIFICAR ESTRUTURA
-- =============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'historico_fases'
ORDER BY ordinal_position;
