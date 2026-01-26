-- =============================================
-- SISTEMA DE ESTOQUE DE ARMAÇÕES DE ÓCULOS
-- =============================================
-- Migração para criar o sistema completo de gestão de estoque
-- de armações de óculos com histórico e rastreabilidade
-- =============================================

-- =============================================
-- ENUMS
-- =============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'armacao_tipo') THEN
    CREATE TYPE public.armacao_tipo AS ENUM ('masculino', 'feminino', 'unissex');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'armacao_status') THEN
    CREATE TYPE public.armacao_status AS ENUM ('disponivel', 'utilizada', 'perdida', 'danificada');
  END IF;
END $$;

-- =============================================
-- FUNÇÃO PARA GERAR NUMERAÇÃO SEQUENCIAL
-- =============================================
CREATE OR REPLACE FUNCTION public.gerar_numeracao_armacao()
RETURNS TEXT AS $$
DECLARE
  ultima_numeracao TEXT;
  proximo_numero INTEGER;
BEGIN
  -- Buscar a última numeração
  SELECT numeracao INTO ultima_numeracao
  FROM public.armacoes
  ORDER BY CAST(SUBSTRING(numeracao FROM '^[0-9]+') AS INTEGER) DESC
  LIMIT 1;
  
  -- Se não houver nenhuma, começar do 1
  IF ultima_numeracao IS NULL THEN
    RETURN '0001';
  END IF;
  
  -- Extrair número e incrementar
  proximo_numero := CAST(SUBSTRING(ultima_numeracao FROM '^[0-9]+') AS INTEGER) + 1;
  
  -- Formatar com zeros à esquerda (4 dígitos)
  RETURN LPAD(proximo_numero::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =============================================
-- TABELA: ESTOQUE DE ARMAÇÕES
-- =============================================
CREATE TABLE IF NOT EXISTS public.armacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numeracao TEXT NOT NULL UNIQUE,
  cor TEXT NOT NULL,
  tipo armação_tipo NOT NULL,
  marca TEXT NOT NULL,
  status armação_status NOT NULL DEFAULT 'disponivel',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_armacoes_updated_at ON public.armacoes;
CREATE TRIGGER update_armacoes_updated_at
  BEFORE UPDATE ON public.armacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABELA: HISTÓRICO DE USO DE ARMAÇÕES
-- =============================================
CREATE TABLE IF NOT EXISTS public.armacoes_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  armação_id UUID NOT NULL REFERENCES public.armacoes(id) ON DELETE RESTRICT,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE RESTRICT,
  data_selecao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status armação_status NOT NULL DEFAULT 'utilizada',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- ADICIONAR CAMPO ARMAÇÃO_ID NA TABELA ALUNOS
-- =============================================
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS armação_id UUID REFERENCES public.armacoes(id) ON DELETE SET NULL;

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_armacoes_status ON public.armacoes(status);
CREATE INDEX IF NOT EXISTS idx_armacoes_numeracao ON public.armacoes(numeracao);
CREATE INDEX IF NOT EXISTS idx_armacoes_tipo ON public.armacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_armacoes_historico_aluno ON public.armacoes_historico(aluno_id);
CREATE INDEX IF NOT EXISTS idx_armacoes_historico_armacao ON public.armacoes_historico(armacao_id);
CREATE INDEX IF NOT EXISTS idx_armacoes_historico_data ON public.armacoes_historico(data_selecao);
CREATE INDEX IF NOT EXISTS idx_alunos_armacao ON public.alunos(armacao_id);

-- =============================================
-- COMENTÁRIOS NAS TABELAS E COLUNAS
-- =============================================
COMMENT ON TABLE public.armacoes IS 'Estoque de armações de óculos disponíveis no sistema';
COMMENT ON COLUMN public.armacoes.numeracao IS 'Numeração única sequencial gerada automaticamente (ex: 0001, 0002)';
COMMENT ON COLUMN public.armacoes.cor IS 'Cor da armação';
COMMENT ON COLUMN public.armacoes.tipo IS 'Tipo da armação: masculino, feminino ou unissex';
COMMENT ON COLUMN public.armacoes.marca IS 'Marca da armação';
COMMENT ON COLUMN public.armacoes.status IS 'Status atual da armação: disponivel, utilizada, perdida ou danificada';

COMMENT ON TABLE public.armacoes_historico IS 'Histórico de uso das armações vinculadas aos alunos';
COMMENT ON COLUMN public.armacoes_historico.data_selecao IS 'Data e hora em que a armação foi selecionada para o aluno';
COMMENT ON COLUMN public.armacoes_historico.status IS 'Status da armação no momento da seleção';

COMMENT ON COLUMN public.alunos.armacao_id IS 'Referência à armação vinculada ao aluno quando em produção de óculos';
