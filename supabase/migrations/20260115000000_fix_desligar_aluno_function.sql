-- =============================================
-- CORREÇÃO DA FUNÇÃO DESLIGAR_ALUNO
-- =============================================
-- Correção dos problemas com coluna armação_id e permissões RLS

-- Recriar a função com correções
CREATE OR REPLACE FUNCTION desligar_aluno(
  aluno_id UUID,
  user_id UUID,
  motivo TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  aluno_exists BOOLEAN;
  armacao_id UUID;
  historico_id UUID;
BEGIN
  -- Verificar se o aluno existe e está ativo
  SELECT EXISTS(SELECT 1 FROM alunos WHERE id = aluno_id AND ativo = true)
  INTO aluno_exists;

  IF NOT aluno_exists THEN
    RAISE EXCEPTION 'Aluno não encontrado ou já está inativo';
  END IF;

  -- Verificar se o aluno tem uma armação vinculada
  -- Usar EXECUTE para acessar coluna com acento corretamente
  EXECUTE 'SELECT ah.id, ah."armacão_id" FROM armacoes_historico ah WHERE ah.aluno_id = $1 ORDER BY ah.created_at DESC LIMIT 1'
  INTO historico_id, armacao_id
  USING aluno_id;

  -- Se existe armação vinculada, liberá-la
  IF historico_id IS NOT NULL AND armacao_id IS NOT NULL THEN
    -- Atualizar status da armação para disponível
    UPDATE armacoes
    SET status = 'disponivel'
    WHERE id = armacao_id;

    -- Remover o registro do histórico
    DELETE FROM armacoes_historico
    WHERE id = historico_id;
  END IF;

  -- Atualizar o aluno como inativo
  UPDATE alunos
  SET
    ativo = false,
    desligado_por = user_id,
    data_desligamento = NOW(),
    motivo_desligamento = motivo
  WHERE id = aluno_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro em desligar_aluno: aluno_id=%, user_id=%, error=%', aluno_id, user_id, SQLERRM;
    RAISE EXCEPTION 'Erro ao desligar aluno: %', SQLERRM;
END;
$$;

-- =============================================
-- VERIFICAÇÃO E CORREÇÃO DE POLÍTICAS RLS
-- =============================================

-- Garantir que RLS está habilitado
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.armacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.armacoes_historico ENABLE ROW LEVEL SECURITY;

-- Remover políticas conflitantes
DROP POLICY IF EXISTS "Authenticated users can access alunos for inativos" ON public.alunos;
DROP POLICY IF EXISTS "Authenticated users can access armacoes_historico for inativos" ON public.armacoes_historico;
DROP POLICY IF EXISTS "Authenticated users can access armacoes for inativos" ON public.armacoes;

-- Criar políticas permissivas para operações de alunos inativos
CREATE POLICY "users_manage_alunos_inativos"
  ON public.alunos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_manage_armacoes_historico_inativos"
  ON public.armacoes_historico FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_manage_armacoes_inativos"
  ON public.armacoes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- TESTE DA FUNÇÃO
-- =============================================

-- Comentários para teste:
-- SELECT desligar_aluno('uuid-do-aluno', 'uuid-do-usuario', 'Teste de correção');
-- SELECT * FROM alunos WHERE id = 'uuid-do-aluno';
-- SELECT * FROM armacoes WHERE id = 'uuid-da-armacao';