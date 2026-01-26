-- =============================================
-- MIGRAÇÃO: ALTERAR "encerrado" PARA "entregue" NO ENUM student_phase
-- =============================================
-- Esta migração altera o valor 'encerrado' para 'entregue' no enum student_phase

-- Primeiro, adicionar o novo valor 'entregue' ao enum
ALTER TYPE public.student_phase ADD VALUE IF NOT EXISTS 'entregue';

-- Atualizar todos os registros que usam 'encerrado' para 'entregue'
UPDATE public.alunos 
SET fase_atual = 'entregue'::public.student_phase 
WHERE fase_atual = 'encerrado'::public.student_phase;

-- Nota: Não podemos remover valores de ENUM diretamente no PostgreSQL
-- O valor 'encerrado' permanecerá no enum, mas não será mais usado
-- Para remover completamente, seria necessário recriar o enum, mas isso é mais complexo
-- Por enquanto, apenas adicionamos 'entregue' e atualizamos os registros
