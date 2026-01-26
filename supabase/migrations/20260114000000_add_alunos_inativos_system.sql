-- Adicionar sistema de alunos inativos/desligados
-- Este sistema permite manter o histórico completo dos alunos sem excluir fisicamente

-- Adicionar campos para controle de status ativo/inativo
ALTER TABLE alunos
ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS desligado_por UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS data_desligamento TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS motivo_desligamento TEXT;

-- Adicionar comentário explicativo na tabela
COMMENT ON COLUMN alunos.ativo IS 'Indica se o aluno está ativo (true) ou inativo/desligado (false)';
COMMENT ON COLUMN alunos.desligado_por IS 'ID do usuário que realizou o desligamento';
COMMENT ON COLUMN alunos.data_desligamento IS 'Data e hora em que o aluno foi desligado';
COMMENT ON COLUMN alunos.motivo_desligamento IS 'Motivo opcional do desligamento';

-- Criar índice para melhorar performance das consultas por status
CREATE INDEX IF NOT EXISTS idx_alunos_ativo ON alunos(ativo);

-- Criar índice para consultas por data de desligamento
CREATE INDEX IF NOT EXISTS idx_alunos_data_desligamento ON alunos(data_desligamento) WHERE ativo = false;

-- Criar função para obter informações do usuário que desligou
CREATE OR REPLACE FUNCTION get_user_info(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  nome TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    COALESCE(up.raw_user_meta_data->>'name', u.email) as nome
  FROM auth.users u
  LEFT JOIN auth.user_metadata up ON u.id = up.user_id
  WHERE u.id = user_id;
END;
$$;

-- Atualizar registros existentes para garantir que todos sejam marcados como ativos
UPDATE alunos SET ativo = true WHERE ativo IS NULL;

-- Criar view para alunos ativos (para manter compatibilidade)
CREATE OR REPLACE VIEW alunos_ativos AS
SELECT * FROM alunos WHERE ativo = true;

-- Criar view específica para relatórios (apenas alunos ativos)
-- IMPORTANTE: Use esta view para todos os relatórios
CREATE OR REPLACE VIEW alunos_relatorios AS
SELECT * FROM alunos WHERE ativo = true;

-- Criar view para alunos inativos/desligados
CREATE OR REPLACE VIEW alunos_inativos AS
SELECT
  a.*,
  u.email as usuario_desligamento_email,
  COALESCE(u.raw_user_meta_data->>'name', u.email) as usuario_desligamento_nome
FROM alunos a
LEFT JOIN auth.users u ON a.desligado_por = u.id
WHERE a.ativo = false;

-- Adicionar políticas RLS (Row Level Security) se necessário
-- Nota: As políticas existentes devem ser atualizadas para considerar o campo 'ativo'

-- Função para "desligar" aluno (soft delete)
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

  -- Verificar se o aluno tem uma armação vinculada e liberá-la
  -- Usar query direta com aspas duplas para o nome da coluna
  EXECUTE 'SELECT ah.id, ah."armacão_id" FROM armacoes_historico ah WHERE ah.aluno_id = $1 ORDER BY ah.created_at DESC LIMIT 1'
  INTO historico_id, armacao_id
  USING aluno_id;

  -- Se existe armação vinculada, liberá-la
  IF historico_id IS NOT NULL AND armacao_id IS NOT NULL THEN
    -- Atualizar status da armação para disponível
    UPDATE armacoes
    SET status = 'disponivel'
    WHERE id = armacao_id;

    -- Remover o registro do histórico (desvincular)
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
    -- Log do erro para debug
    RAISE NOTICE 'Erro em desligar_aluno: aluno_id=%, user_id=%, error=%', aluno_id, user_id, SQLERRM;
    RAISE EXCEPTION 'Erro ao desligar aluno: %', SQLERRM;
END;
$$;

-- Função para "reativar" aluno
CREATE OR REPLACE FUNCTION reativar_aluno(aluno_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  aluno_exists BOOLEAN;
BEGIN
  -- Verificar se o aluno existe e está inativo
  SELECT EXISTS(SELECT 1 FROM alunos WHERE id = aluno_id AND ativo = false)
  INTO aluno_exists;

  IF NOT aluno_exists THEN
    RAISE EXCEPTION 'Aluno não encontrado ou já está ativo';
  END IF;

  -- Limpar campos de desligamento, redefinir fase para triagem e reativar
  UPDATE alunos
  SET
    ativo = true,
    fase_atual = 'triagem',
    desligado_por = NULL,
    data_desligamento = NULL,
    motivo_desligamento = NULL
  WHERE id = aluno_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para debug
    RAISE NOTICE 'Erro em desligar_aluno: %', SQLERRM;
    RAISE EXCEPTION 'Erro ao desligar aluno: %', SQLERRM;
END;
$$;

-- Atualizar comentários na tabela
COMMENT ON TABLE alunos IS 'Tabela de alunos com sistema de soft delete (ativo/inativo)';
COMMENT ON FUNCTION desligar_aluno(UUID, UUID, TEXT) IS 'Função para marcar aluno como inativo/desligado';
COMMENT ON FUNCTION reativar_aluno(UUID) IS 'Função para reativar aluno previamente desligado - redefine fase para triagem';
COMMENT ON VIEW alunos_ativos IS 'View com alunos ativos (compatibilidade - use alunos_relatorios para relatórios)';
COMMENT ON VIEW alunos_relatorios IS 'View específica para relatórios - apenas alunos ativos';
COMMENT ON VIEW alunos_inativos IS 'View com alunos inativos e informações do usuário que os desligou';

-- =============================================
-- POLÍTICAS RLS PARA SUPORTE ÀS NOVAS FUNCIONALIDADES
-- =============================================

-- Remover políticas antigas que podem estar conflitantes
DROP POLICY IF EXISTS "RPC functions can access alunos" ON public.alunos;
DROP POLICY IF EXISTS "RPC functions can access armacoes_historico" ON public.armacoes_historico;
DROP POLICY IF EXISTS "RPC functions can access armacoes" ON public.armacoes;
DROP POLICY IF EXISTS "Authenticated users can access alunos for inativos" ON public.alunos;
DROP POLICY IF EXISTS "Authenticated users can access armacoes_historico for inativos" ON public.armacoes_historico;
DROP POLICY IF EXISTS "Authenticated users can access armacoes for inativos" ON public.armacoes;

-- Garantir que usuários autenticados possam acessar as tabelas necessárias
-- Políticas permissivas para operações normais
CREATE POLICY "Authenticated users can access alunos for inativos"
  ON public.alunos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can access armacoes_historico for inativos"
  ON public.armacoes_historico FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can access armacoes for inativos"
  ON public.armacoes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);