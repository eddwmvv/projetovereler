-- =============================================
-- SISTEMA DE LOTES - CRIAÇÃO DE TABELAS
-- =============================================
-- Execute este script no SQL Editor do Supabase

-- =============================================
-- ENUM PARA STATUS DO LOTE
-- =============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lote_status') THEN
    CREATE TYPE public.lote_status AS ENUM ('criado', 'em_preparo', 'recebido');
  END IF;
END $$;

-- =============================================
-- TABELA: LOTES
-- =============================================
CREATE TABLE IF NOT EXISTS public.lotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL, -- Nome identificador do lote (ex: "Lote 001/2026")
  descricao TEXT, -- Descrição opcional do lote
  escola_id UUID NOT NULL REFERENCES public.escolas(id) ON DELETE RESTRICT,
  turno shift_type NOT NULL,
  status lote_status NOT NULL DEFAULT 'criado',
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_preparo TIMESTAMP WITH TIME ZONE, -- Quando mudou para "em_preparo"
  data_recebimento TIMESTAMP WITH TIME ZONE, -- Quando mudou para "recebido"
  observacoes TEXT,
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_lotes_updated_at ON public.lotes;
CREATE TRIGGER update_lotes_updated_at
  BEFORE UPDATE ON public.lotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABELA: ITENS DO LOTE (ÓCULOS)
-- =============================================
CREATE TABLE IF NOT EXISTS public.lote_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lote_id UUID NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
  quantidade_entregue INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_entregue >= 0),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar coluna tamanho_id após criar a tabela
ALTER TABLE public.lote_itens
ADD COLUMN IF NOT EXISTS tamanho_id UUID REFERENCES public.tamanhos(id) ON DELETE RESTRICT;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_lote_itens_updated_at ON public.lote_itens;
CREATE TRIGGER update_lote_itens_updated_at
  BEFORE UPDATE ON public.lote_itens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABELA: HISTÓRICO DE MUDANÇAS DE STATUS
-- =============================================
CREATE TABLE IF NOT EXISTS public.lotes_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lote_id UUID NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
  status_anterior lote_status,
  status_novo lote_status NOT NULL,
  observacoes TEXT,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_lotes_escola ON public.lotes(escola_id);
CREATE INDEX IF NOT EXISTS idx_lotes_status ON public.lotes(status);
CREATE INDEX IF NOT EXISTS idx_lotes_data_criacao ON public.lotes(data_criacao);
CREATE INDEX IF NOT EXISTS idx_lote_itens_lote ON public.lote_itens(lote_id);
CREATE INDEX IF NOT EXISTS idx_lote_itens_tamanho ON public.lote_itens(tamanho_id);
CREATE INDEX IF NOT EXISTS idx_lotes_historico_lote ON public.lotes_historico(lote_id);

-- =============================================
-- FUNCTION: GERAR PRÓXIMO NÚMERO DE LOTE
-- =============================================
CREATE OR REPLACE FUNCTION public.gerar_proximo_numero_lote()
RETURNS TEXT AS $$
DECLARE
  v_ultimo_numero INTEGER;
  v_proximo_numero TEXT;
BEGIN
  -- Buscar o último número de lote (extraindo apenas os dígitos após 'LT')
  SELECT COALESCE(MAX(CAST(SUBSTRING(nome FROM 'LT(\\d+)') AS INTEGER)), 0)
  INTO v_ultimo_numero
  FROM public.lotes
  WHERE nome ~ '^LT\\d+$';
  
  -- Gerar o próximo número com zero padding (ex: LT01, LT02, ...)
  v_proximo_numero := 'LT' || LPAD((v_ultimo_numero + 1)::TEXT, 2, '0');
  
  RETURN v_proximo_numero;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCTION: ATUALIZAR STATUS DO LOTE
-- =============================================
CREATE OR REPLACE FUNCTION public.atualizar_status_lote(
  p_lote_id UUID,
  p_novo_status lote_status,
  p_observacoes TEXT DEFAULT NULL,
  p_usuario_id UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_status_atual lote_status;
BEGIN
  -- Buscar status atual
  SELECT status INTO v_status_atual
  FROM public.lotes
  WHERE id = p_lote_id;

  IF v_status_atual IS NULL THEN
    RAISE EXCEPTION 'Lote não encontrado';
  END IF;

  -- Validar transição de status
  IF v_status_atual = 'recebido' THEN
    RAISE EXCEPTION 'Não é possível alterar o status de um lote já recebido';
  END IF;

  -- Atualizar o lote
  UPDATE public.lotes
  SET 
    status = p_novo_status,
    data_preparo = CASE WHEN p_novo_status = 'em_preparo' THEN now() ELSE data_preparo END,
    data_recebimento = CASE WHEN p_novo_status = 'recebido' THEN now() ELSE data_recebimento END,
    observacoes = COALESCE(p_observacoes, observacoes)
  WHERE id = p_lote_id;

  -- Registrar no histórico
  INSERT INTO public.lotes_historico (lote_id, status_anterior, status_novo, observacoes, usuario_id)
  VALUES (p_lote_id, v_status_atual, p_novo_status, p_observacoes, p_usuario_id);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCTION: BUSCAR LOTES COM DETALHES
-- =============================================
CREATE OR REPLACE FUNCTION public.buscar_lotes_com_detalhes()
RETURNS TABLE (
  id UUID,
  nome TEXT,
  descricao TEXT,
  escola_id UUID,
  escola_nome TEXT,
  municipio_nome TEXT,
  turno shift_type,
  status lote_status,
  data_criacao TIMESTAMP WITH TIME ZONE,
  data_preparo TIMESTAMP WITH TIME ZONE,
  data_recebimento TIMESTAMP WITH TIME ZONE,
  total_oculos INTEGER,
  total_entregue INTEGER,
  observacoes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.nome,
    l.descricao,
    l.escola_id,
    e.nome AS escola_nome,
    m.nome AS municipio_nome,
    l.turno,
    l.status,
    l.data_criacao,
    l.data_preparo,
    l.data_recebimento,
    COALESCE(SUM(li.quantidade), 0)::INTEGER AS total_oculos,
    COALESCE(SUM(li.quantidade_entregue), 0)::INTEGER AS total_entregue,
    l.observacoes
  FROM public.lotes l
  INNER JOIN public.escolas e ON l.escola_id = e.id
  INNER JOIN public.municipios m ON e.municipio_id = m.id
  LEFT JOIN public.lote_itens li ON l.id = li.lote_id
  GROUP BY l.id, e.nome, m.nome
  ORDER BY l.data_criacao DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- =============================================
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lote_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes_historico ENABLE ROW LEVEL SECURITY;

-- Política para leitura
CREATE POLICY "Permitir leitura de lotes para usuários autenticados"
  ON public.lotes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura de itens de lote para usuários autenticados"
  ON public.lote_itens FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura de histórico de lotes para usuários autenticados"
  ON public.lotes_historico FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política para inserção
CREATE POLICY "Permitir inserção de lotes para usuários autenticados"
  ON public.lotes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção de itens de lote para usuários autenticados"
  ON public.lote_itens FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção de histórico de lotes para usuários autenticados"
  ON public.lotes_historico FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização
CREATE POLICY "Permitir atualização de lotes para usuários autenticados"
  ON public.lotes FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização de itens de lote para usuários autenticados"
  ON public.lote_itens FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Política para exclusão
CREATE POLICY "Permitir exclusão de lotes para usuários autenticados"
  ON public.lotes FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão de itens de lote para usuários autenticados"
  ON public.lote_itens FOR DELETE
  USING (auth.role() = 'authenticated');
