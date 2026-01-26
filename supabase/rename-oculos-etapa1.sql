-- =============================================
-- ETAPA 1: Adicionar "producao_de_oculos" ao enum
-- =============================================
-- Execute APENAS esta parte primeiro
-- Aguarde alguns segundos antes de executar a ETAPA 2
-- =============================================

-- Adicionar o novo valor "producao_de_oculos" ao enum
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_phase') THEN
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_enum 
      WHERE enumlabel = 'producao_de_oculos' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'student_phase')
    ) THEN
      ALTER TYPE public.student_phase ADD VALUE 'producao_de_oculos';
      RAISE NOTICE 'Valor "producao_de_oculos" adicionado com sucesso!';
    ELSE
      RAISE NOTICE 'Valor "producao_de_oculos" já existe.';
    END IF;
  ELSE
    RAISE EXCEPTION 'O enum student_phase não existe.';
  END IF;
END $$;

-- Verificar se foi adicionado
SELECT 
  e.enumlabel as fase
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'student_phase'
ORDER BY e.enumsortorder;
