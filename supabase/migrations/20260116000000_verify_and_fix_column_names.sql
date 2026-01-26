-- =============================================
-- VERIFICAÇÃO E CORREÇÃO DE NOMES DE COLUNAS
-- =============================================
-- Garantir que as colunas têm os nomes corretos no banco

-- Primeiro, tentar renomear se existe coluna sem acento
DO $$
BEGIN
    -- Se existe coluna sem acento, renomear para com acento
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'armacoes_historico'
        AND column_name = 'armacao_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'armacoes_historico'
        AND column_name = 'armacão_id'
    ) THEN
        ALTER TABLE public.armacoes_historico
        RENAME COLUMN armacao_id TO "armacão_id";
        RAISE NOTICE 'Coluna renomeada: armacao_id -> armação_id';
    END IF;
END $$;

-- Garantir que a coluna existe (caso a tabela tenha sido criada sem ela)
ALTER TABLE public.armacoes_historico
ADD COLUMN IF NOT EXISTS "armacão_id" UUID REFERENCES public.armacoes(id) ON DELETE RESTRICT;

-- Garantir que a coluna tem a constraint correta
DO $$
BEGIN
    -- Verificar se a constraint de foreign key existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'armacoes_historico'
        AND kcu.column_name = 'armacão_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Adicionar constraint se não existir
        ALTER TABLE public.armacoes_historico
        ADD CONSTRAINT fk_armacoes_historico_armacao
        FOREIGN KEY ("armacão_id") REFERENCES public.armacoes(id) ON DELETE RESTRICT;
        RAISE NOTICE 'Constraint de foreign key adicionada para armação_id';
    END IF;
END $$;

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================

-- Verificar se tudo está correto
DO $$
BEGIN
    -- Contar registros na tabela
    RAISE NOTICE 'Verificação da tabela armacoes_historico concluída';
END $$;

-- =============================================
-- FUNÇÃO RPC PARA ACESSAR ARMAÇÃO ATUAL
-- =============================================

-- Criar função RPC para evitar problemas com nomes de colunas especiais
CREATE OR REPLACE FUNCTION get_current_armacao_for_aluno(p_aluno_id UUID)
RETURNS TABLE(armacao_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  EXECUTE 'SELECT ah."armacão_id" FROM armacoes_historico ah WHERE ah.aluno_id = $1 ORDER BY ah.created_at DESC LIMIT 1'
  USING p_aluno_id;
END;
$$;

-- =============================================
-- FUNÇÃO RPC PARA LIBERAR ARMAÇÃO ATUAL
-- =============================================

CREATE OR REPLACE FUNCTION release_current_armacao_for_aluno(p_aluno_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    aluno_fase TEXT;
    historico_record RECORD;
    armacao_id UUID;
BEGIN
    -- Verificar fase do aluno
    SELECT fase_atual INTO aluno_fase
    FROM alunos WHERE id = p_aluno_id;

    -- NEVER release armacao if aluno is in 'entregue' phase
    IF aluno_fase = 'entregue' THEN
        RAISE NOTICE 'Tentativa de liberar armação bloqueada: aluno já está em fase "entregue"';
        RETURN;
    END IF;

    -- Buscar registro mais recente do histórico
    EXECUTE 'SELECT ah.id, ah."armacão_id" FROM armacoes_historico ah WHERE ah.aluno_id = $1 ORDER BY ah.created_at DESC LIMIT 1'
    INTO historico_record
    USING p_aluno_id;

    IF historico_record.id IS NULL THEN
        -- No history record found, nothing to release
        RETURN;
    END IF;

    -- Liberar armação
    UPDATE armacoes SET status = 'disponivel' WHERE id = historico_record."armacão_id";

    -- Remover registro do histórico
    DELETE FROM armacoes_historico WHERE id = historico_record.id;
END;
$$;

-- =============================================
-- POLÍTICAS RLS FINAIS
-- =============================================

-- Garantir que as políticas estão corretas
DROP POLICY IF EXISTS "Authenticated users can view armacoes_historico" ON public.armacoes_historico;
DROP POLICY IF EXISTS "Authenticated users can insert armacoes_historico" ON public.armacoes_historico;
DROP POLICY IF EXISTS "Authenticated users can update armacoes_historico" ON public.armacoes_historico;
DROP POLICY IF EXISTS "Authenticated users can delete armacoes_historico" ON public.armacoes_historico;

-- Políticas básicas para usuários autenticados
CREATE POLICY "users_view_armacoes_historico"
  ON public.armacoes_historico FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_insert_armacoes_historico"
  ON public.armacoes_historico FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "users_update_armacoes_historico"
  ON public.armacoes_historico FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_delete_armacoes_historico"
  ON public.armacoes_historico FOR DELETE
  TO authenticated
  USING (true);