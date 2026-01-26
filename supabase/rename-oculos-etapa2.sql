-- =============================================
-- ETAPA 2: Atualizar registros
-- =============================================
-- Execute esta parte APÓS a ETAPA 1
-- Aguarde alguns segundos após executar a ETAPA 1
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
  fase_atual::text,
  COUNT(*) as total
FROM public.alunos
WHERE fase_atual IN ('oculos'::public.student_phase, 'producao_de_oculos'::public.student_phase)
GROUP BY fase_atual
UNION ALL
SELECT 
  'historico_fases' as tabela,
  fase::text,
  COUNT(*) as total
FROM public.historico_fases
WHERE fase IN ('oculos'::public.student_phase, 'producao_de_oculos'::public.student_phase)
GROUP BY fase
ORDER BY tabela, fase_atual;

-- Verificar todos os valores do enum
SELECT 
  e.enumlabel as fase,
  e.enumsortorder as ordem
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'student_phase'
ORDER BY e.enumsortorder;
