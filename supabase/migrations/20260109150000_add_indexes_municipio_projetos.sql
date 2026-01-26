-- =============================================
-- MIGRAÇÃO: ADICIONAR ÍNDICES PARA PERFORMANCE
-- =============================================
-- Esta migração adiciona índices na tabela municipio_projetos
-- para melhorar a performance das consultas de relacionamentos

-- Índice para buscar municípios por projeto
CREATE INDEX IF NOT EXISTS idx_municipio_projetos_projeto 
  ON public.municipio_projetos(projeto_id);

-- Índice para buscar projetos por município
CREATE INDEX IF NOT EXISTS idx_municipio_projetos_municipio 
  ON public.municipio_projetos(municipio_id);

-- Índice composto para verificação rápida de relacionamentos
CREATE INDEX IF NOT EXISTS idx_municipio_projetos_composite 
  ON public.municipio_projetos(projeto_id, municipio_id);
