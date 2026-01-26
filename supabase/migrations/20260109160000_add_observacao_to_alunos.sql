-- =============================================
-- MIGRAÇÃO: ADICIONAR CAMPO observacao NA TABELA alunos
-- =============================================
-- Esta migração adiciona o campo observacao (opcional) na tabela alunos

ALTER TABLE public.alunos 
  ADD COLUMN IF NOT EXISTS observacao TEXT;
