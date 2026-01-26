-- Migração para corrigir a função reativar_aluno
-- Agora a função redefine a fase para 'triagem' quando reativa um aluno

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
    RAISE NOTICE 'Erro em reativar_aluno: %', SQLERRM;
    RAISE EXCEPTION 'Erro ao reativar aluno: %', SQLERRM;
END;
$$;

-- Atualizar comentário da função
COMMENT ON FUNCTION reativar_aluno(UUID) IS 'Função para reativar aluno previamente desligado - redefine fase para triagem';