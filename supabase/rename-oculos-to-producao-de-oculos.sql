-- =============================================
-- RENOMEAR FASE "oculos" PARA "producao_de_oculos"
-- =============================================
-- Execute este script no SQL Editor do Supabase
-- https://app.supabase.com/project/[seu-projeto]/sql/new
-- 
-- IMPORTANTE: Este script deve ser executado em DUAS ETAPAS separadas
-- =============================================

-- =============================================
-- ETAPA 1: Adicionar o novo valor ao enum
-- Execute apenas esta parte primeiro
-- =============================================

-- Verificar se "producao_de_oculos" já existe, se não, adicionar
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

-- =============================================
-- AGUARDE ALGUNS SEGUNDOS APÓS A ETAPA 1
-- ANTES DE EXECUTAR A ETAPA 2
-- =============================================

-- =============================================
-- ETAPA 2: Atualizar os registros
-- Execute esta parte APÓS a ETAPA 1 ser commitada
-- =============================================

-- Atualizar registros na tabela alunos
UPDATE public.alunos
SET fase_atual = 'producao_de_oculos'::public.student_phase
WHERE fase_atual = 'oculos'::public.student_phase;

-- Atualizar registros na tabela historico_fases
UPDATE public.historico_fases
SET fase = 'producao_de_oculos'::public.student_phase
WHERE fase = 'oculos'::public.student_phase;

-- Verificar resultados
SELECT 
  'alunos' as tabela,
  fase_atual,
  COUNT(*) as total
FROM public.alunos
WHERE fase_atual IN ('oculos', 'producao_de_oculos')::public.student_phase[]
GROUP BY fase_atual
UNION ALL
SELECT 
  'historico_fases' as tabela,
  fase::text as fase_atual,
  COUNT(*) as total
FROM public.historico_fases
WHERE fase IN ('oculos', 'producao_de_oculos')::public.student_phase[]
GROUP BY fase;

-- Mostrar todos os valores do enum
SELECT 
  e.enumlabel as fase,
  e.enumsortorder as ordem
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'student_phase'
ORDER BY e.enumsortorder;
