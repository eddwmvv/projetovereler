-- =============================================
-- ADICIONAR FASE "ENTREGUE" AO ENUM student_phase
-- =============================================
-- Execute este script no SQL Editor do Supabase
-- https://app.supabase.com/project/[seu-projeto]/sql/new
-- =============================================

-- Verificar se 'entregue' já existe no enum, se não, adicionar
DO $$ 
BEGIN
  -- Verificar se o enum student_phase existe
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_phase') THEN
    -- Verificar se 'entregue' já existe
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_enum 
      WHERE enumlabel = 'entregue' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'student_phase')
    ) THEN
      -- Adicionar 'entregue' ao enum student_phase
      ALTER TYPE public.student_phase ADD VALUE 'entregue';
      
      RAISE NOTICE 'Valor "entregue" adicionado ao enum student_phase com sucesso!';
    ELSE
      RAISE NOTICE 'Valor "entregue" já existe no enum student_phase.';
    END IF;
  ELSE
    RAISE EXCEPTION 'O enum student_phase não existe. Execute primeiro o script database-setup.sql';
  END IF;
END $$;

-- Verificar os valores do enum após a execução
SELECT 
  e.enumlabel as fase,
  e.enumsortorder as ordem
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'student_phase'
ORDER BY e.enumsortorder;
