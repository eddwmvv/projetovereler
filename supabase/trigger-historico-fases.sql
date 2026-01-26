-- =============================================
-- TRIGGER PARA RASTREAR MUDANÇAS DE FASE AUTOMATICAMENTE
-- =============================================
-- Este trigger registra automaticamente no histórico_fases
-- sempre que o campo fase_atual do aluno é alterado

-- Primeiro, garantir que a coluna user_id existe
ALTER TABLE public.historico_fases 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Função para registrar mudança de fase
CREATE OR REPLACE FUNCTION public.registrar_mudanca_fase()
RETURNS TRIGGER AS $$
DECLARE
  armacao_exists BOOLEAN;
BEGIN
  -- Só registra se a fase realmente mudou
  IF OLD.fase_atual IS DISTINCT FROM NEW.fase_atual THEN
    -- Validação: se mudando PARA "producao_de_oculos", verificar se há armação selecionada
    IF NEW.fase_atual = 'producao_de_oculos' THEN
      -- Verificar se o aluno tem uma armação vinculada na tabela armacoes_historico
      SELECT EXISTS(
        SELECT 1 FROM public.armacoes_historico
        WHERE aluno_id = NEW.id
        AND data_selecao IS NOT NULL
        AND (data_liberacao IS NULL OR data_liberacao > now())
      ) INTO armacao_exists;

      -- Se não tem armação, impedir a mudança
      IF NOT armacao_exists THEN
        RAISE EXCEPTION 'Não é possível alterar para "Produção de Óculos" sem selecionar uma armação do estoque primeiro. Selecione uma armação antes de avançar para esta fase.';
      END IF;
    END IF;

    INSERT INTO public.historico_fases (
      aluno_id,
      fase,
      status,
      data,
      user_id,
      observacoes
    ) VALUES (
      NEW.id,
      NEW.fase_atual,
      'pendente', -- Status padrão
      now(),
      auth.uid(), -- ID do usuário atual
      format('Fase alterada de %s para %s', OLD.fase_atual, NEW.fase_atual)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_registrar_mudanca_fase ON public.alunos;

-- Criar trigger
CREATE TRIGGER trigger_registrar_mudanca_fase
  AFTER UPDATE OF fase_atual ON public.alunos
  FOR EACH ROW
  WHEN (OLD.fase_atual IS DISTINCT FROM NEW.fase_atual)
  EXECUTE FUNCTION public.registrar_mudanca_fase();

-- Comentário
COMMENT ON FUNCTION public.registrar_mudanca_fase() IS
'Registra automaticamente mudanças de fase do aluno no histórico_fases e valida seleção de armação para produção de óculos';
