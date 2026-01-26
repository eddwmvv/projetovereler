-- =============================================
-- QUERIES SQL PARA RELATÓRIOS - SISTEMA VER E LER
-- =============================================
-- Este arquivo contém queries SQL otimizadas para gerar os relatórios
-- mencionados na análise de escopo
-- =============================================

-- =============================================
-- 1. RELATÓRIO GERAL - ESTATÍSTICAS RÁPIDAS
-- =============================================

-- Total de alunos por fase
SELECT 
  fase_atual,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM alunos), 2) as percentual
FROM alunos
GROUP BY fase_atual
ORDER BY 
  CASE fase_atual
    WHEN 'triagem' THEN 1
    WHEN 'consulta' THEN 2
    WHEN 'producao_de_oculos' THEN 3
    WHEN 'entregue' THEN 4
  END;

-- =============================================
-- 2. ALUNOS POR FASE COM IDADE
-- =============================================

-- Alunos em cada fase com idade calculada
SELECT 
  fase_atual,
  COUNT(*) as total,
  AVG(EXTRACT(YEAR FROM AGE(data_nascimento))) as idade_media,
  MIN(EXTRACT(YEAR FROM AGE(data_nascimento))) as idade_minima,
  MAX(EXTRACT(YEAR FROM AGE(data_nascimento))) as idade_maxima,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(YEAR FROM AGE(data_nascimento))) as idade_mediana
FROM alunos
GROUP BY fase_atual
ORDER BY 
  CASE fase_atual
    WHEN 'triagem' THEN 1
    WHEN 'consulta' THEN 2
    WHEN 'producao_de_oculos' THEN 3
    WHEN 'entregue' THEN 4
  END;

-- =============================================
-- 3. DISTRIBUIÇÃO ETÁRIA POR FASE
-- =============================================

-- Alunos por faixa etária e fase
SELECT 
  fase_atual,
  CASE 
    WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 0 AND 5 THEN '0-5 anos'
    WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 6 AND 10 THEN '6-10 anos'
    WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 11 AND 15 THEN '11-15 anos'
    WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 16 AND 20 THEN '16-20 anos'
    ELSE '21+ anos'
  END as faixa_etaria,
  COUNT(*) as quantidade
FROM alunos
GROUP BY fase_atual, faixa_etaria
ORDER BY fase_atual, faixa_etaria;

-- =============================================
-- 4. RELATÓRIO POR ESCOLA - COMPLETO
-- =============================================

-- Estatísticas por escola
SELECT 
  e.id as escola_id,
  e.nome as escola_nome,
  m.nome as municipio_nome,
  emp.nome_fantasia as empresa_nome,
  COUNT(DISTINCT t.id) as total_turmas,
  COUNT(a.id) as total_alunos,
  COUNT(CASE WHEN a.fase_atual = 'triagem' THEN 1 END) as alunos_triagem,
  COUNT(CASE WHEN a.fase_atual = 'consulta' THEN 1 END) as alunos_consulta,
  COUNT(CASE WHEN a.fase_atual = 'producao_de_oculos' THEN 1 END) as alunos_producao,
  COUNT(CASE WHEN a.fase_atual = 'entregue' THEN 1 END) as alunos_entregue,
  ROUND(
    COUNT(CASE WHEN a.fase_atual = 'entregue' THEN 1 END) * 100.0 / 
    NULLIF(COUNT(a.id), 0), 
    2
  ) as taxa_conclusao_percentual,
  AVG(EXTRACT(YEAR FROM AGE(a.data_nascimento))) as idade_media,
  COUNT(CASE WHEN a.sexo = 'masculino' THEN 1 END) as masculino,
  COUNT(CASE WHEN a.sexo = 'feminino' THEN 1 END) as feminino,
  COUNT(CASE WHEN a.sexo = 'outro' THEN 1 END) as outro,
  COUNT(CASE WHEN a.sexo = 'nao_informado' THEN 1 END) as nao_informado
FROM escolas e
LEFT JOIN municipios m ON e.municipio_id = m.id
LEFT JOIN empresas emp ON e.empresa_id = emp.id
LEFT JOIN turmas t ON t.escola_id = e.id
LEFT JOIN alunos a ON a.escola_id = e.id
GROUP BY e.id, e.nome, m.nome, emp.nome_fantasia
ORDER BY total_alunos DESC;

-- =============================================
-- 5. DISTRIBUIÇÃO ETÁRIA POR ESCOLA
-- =============================================

-- Faixas etárias por escola
SELECT 
  e.nome as escola_nome,
  CASE 
    WHEN EXTRACT(YEAR FROM AGE(a.data_nascimento)) BETWEEN 0 AND 5 THEN '0-5 anos'
    WHEN EXTRACT(YEAR FROM AGE(a.data_nascimento)) BETWEEN 6 AND 10 THEN '6-10 anos'
    WHEN EXTRACT(YEAR FROM AGE(a.data_nascimento)) BETWEEN 11 AND 15 THEN '11-15 anos'
    WHEN EXTRACT(YEAR FROM AGE(a.data_nascimento)) BETWEEN 16 AND 20 THEN '16-20 anos'
    ELSE '21+ anos'
  END as faixa_etaria,
  COUNT(*) as quantidade
FROM escolas e
INNER JOIN alunos a ON a.escola_id = e.id
GROUP BY e.nome, faixa_etaria
ORDER BY e.nome, faixa_etaria;

-- =============================================
-- 6. TEMPO MÉDIO POR FASE (usando histórico)
-- =============================================

-- Tempo médio que alunos ficam em cada fase
WITH fase_durations AS (
  SELECT 
    hf.aluno_id,
    hf.fase,
    hf.data as inicio_fase,
    LEAD(hf.data) OVER (PARTITION BY hf.aluno_id ORDER BY hf.data) as fim_fase,
    EXTRACT(EPOCH FROM (LEAD(hf.data) OVER (PARTITION BY hf.aluno_id ORDER BY hf.data) - hf.data)) / 86400 as dias_na_fase
  FROM historico_fases hf
)
SELECT 
  fase,
  COUNT(*) as total_registros,
  ROUND(AVG(dias_na_fase), 2) as tempo_medio_dias,
  ROUND(MIN(dias_na_fase), 2) as tempo_minimo_dias,
  ROUND(MAX(dias_na_fase), 2) as tempo_maximo_dias,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY dias_na_fase), 2) as tempo_mediano_dias
FROM fase_durations
WHERE dias_na_fase IS NOT NULL
GROUP BY fase
ORDER BY 
  CASE fase
    WHEN 'triagem' THEN 1
    WHEN 'consulta' THEN 2
    WHEN 'producao_de_oculos' THEN 3
    WHEN 'entregue' THEN 4
  END;

-- =============================================
-- 7. EVOLUÇÃO TEMPORAL - ALUNOS POR MÊS
-- =============================================

-- Evolução do número de alunos ao longo do tempo
SELECT 
  DATE_TRUNC('month', created_at) as mes,
  COUNT(*) as total_alunos_cadastrados,
  COUNT(CASE WHEN fase_atual = 'triagem' THEN 1 END) as alunos_triagem,
  COUNT(CASE WHEN fase_atual = 'consulta' THEN 1 END) as alunos_consulta,
  COUNT(CASE WHEN fase_atual = 'producao_de_oculos' THEN 1 END) as alunos_producao,
  COUNT(CASE WHEN fase_atual = 'entregue' THEN 1 END) as alunos_entregue
FROM alunos
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- =============================================
-- 8. ALUNOS POR TURMA E FASE
-- =============================================

-- Distribuição de alunos por turma e fase
SELECT 
  t.nome as turma_nome,
  t.serie,
  t.turno,
  e.nome as escola_nome,
  COUNT(a.id) as total_alunos,
  COUNT(CASE WHEN a.fase_atual = 'triagem' THEN 1 END) as triagem,
  COUNT(CASE WHEN a.fase_atual = 'consulta' THEN 1 END) as consulta,
  COUNT(CASE WHEN a.fase_atual = 'producao_de_oculos' THEN 1 END) as producao,
  COUNT(CASE WHEN a.fase_atual = 'entregue' THEN 1 END) as entregue
FROM turmas t
LEFT JOIN alunos a ON a.turma_id = t.id
LEFT JOIN escolas e ON t.escola_id = e.id
GROUP BY t.id, t.nome, t.serie, t.turno, e.nome
ORDER BY escola_nome, turma_nome;

-- =============================================
-- 9. RELATÓRIO POR MUNICÍPIO
-- =============================================

-- Estatísticas por município
SELECT 
  m.id as municipio_id,
  m.nome as municipio_nome,
  m.estado,
  COUNT(DISTINCT e.id) as total_escolas,
  COUNT(DISTINCT t.id) as total_turmas,
  COUNT(a.id) as total_alunos,
  COUNT(CASE WHEN a.fase_atual = 'triagem' THEN 1 END) as alunos_triagem,
  COUNT(CASE WHEN a.fase_atual = 'consulta' THEN 1 END) as alunos_consulta,
  COUNT(CASE WHEN a.fase_atual = 'producao_de_oculos' THEN 1 END) as alunos_producao,
  COUNT(CASE WHEN a.fase_atual = 'entregue' THEN 1 END) as alunos_entregue,
  ROUND(
    COUNT(CASE WHEN a.fase_atual = 'entregue' THEN 1 END) * 100.0 / 
    NULLIF(COUNT(a.id), 0), 
    2
  ) as taxa_conclusao_percentual
FROM municipios m
LEFT JOIN escolas e ON e.municipio_id = m.id
LEFT JOIN turmas t ON t.escola_id = e.id
LEFT JOIN alunos a ON a.municipio_id = m.id
GROUP BY m.id, m.nome, m.estado
ORDER BY total_alunos DESC;

-- =============================================
-- 10. RELATÓRIO POR EMPRESA
-- =============================================

-- Estatísticas por empresa
SELECT 
  emp.id as empresa_id,
  emp.nome_fantasia as empresa_nome,
  emp.razao_social,
  COUNT(DISTINCT p.id) as total_projetos,
  COUNT(DISTINCT m.id) as total_municipios,
  COUNT(DISTINCT e.id) as total_escolas,
  COUNT(DISTINCT t.id) as total_turmas,
  COUNT(a.id) as total_alunos,
  COUNT(CASE WHEN a.fase_atual = 'triagem' THEN 1 END) as alunos_triagem,
  COUNT(CASE WHEN a.fase_atual = 'consulta' THEN 1 END) as alunos_consulta,
  COUNT(CASE WHEN a.fase_atual = 'producao_de_oculos' THEN 1 END) as alunos_producao,
  COUNT(CASE WHEN a.fase_atual = 'entregue' THEN 1 END) as alunos_entregue,
  ROUND(
    COUNT(CASE WHEN a.fase_atual = 'entregue' THEN 1 END) * 100.0 / 
    NULLIF(COUNT(a.id), 0), 
    2
  ) as taxa_conclusao_percentual
FROM empresas emp
LEFT JOIN projetos p ON p.empresa_id = emp.id
LEFT JOIN municipio_projetos mp ON mp.projeto_id = p.id
LEFT JOIN municipios m ON m.id = mp.municipio_id
LEFT JOIN escolas e ON e.empresa_id = emp.id
LEFT JOIN turmas t ON t.escola_id = e.id
LEFT JOIN alunos a ON a.empresa_id = emp.id
WHERE emp.status = 'ativo'
GROUP BY emp.id, emp.nome_fantasia, emp.razao_social
ORDER BY total_alunos DESC;

-- =============================================
-- 11. ALUNOS COM TEMPO EXCESSIVO EM UMA FASE
-- =============================================

-- Identificar alunos que estão há muito tempo em uma fase (alerta)
-- Considerando mais de 60 dias em triagem ou consulta, ou mais de 30 dias em produção
SELECT 
  a.id,
  a.nome_completo,
  a.fase_atual,
  e.nome as escola_nome,
  EXTRACT(EPOCH FROM (NOW() - COALESCE(
    (SELECT MAX(hf.data) FROM historico_fases hf WHERE hf.aluno_id = a.id AND hf.fase = a.fase_atual),
    a.created_at
  ))) / 86400 as dias_na_fase_atual,
  CASE 
    WHEN a.fase_atual IN ('triagem', 'consulta') AND 
         EXTRACT(EPOCH FROM (NOW() - COALESCE(
           (SELECT MAX(hf.data) FROM historico_fases hf WHERE hf.aluno_id = a.id AND hf.fase = a.fase_atual),
           a.created_at
         ))) / 86400 > 60 THEN 'ALERTA: Mais de 60 dias'
    WHEN a.fase_atual = 'producao_de_oculos' AND 
         EXTRACT(EPOCH FROM (NOW() - COALESCE(
           (SELECT MAX(hf.data) FROM historico_fases hf WHERE hf.aluno_id = a.id AND hf.fase = a.fase_atual),
           a.created_at
         ))) / 86400 > 30 THEN 'ALERTA: Mais de 30 dias'
    ELSE 'OK'
  END as status_alerta
FROM alunos a
LEFT JOIN escolas e ON a.escola_id = e.id
WHERE a.fase_atual != 'entregue'
HAVING 
  (a.fase_atual IN ('triagem', 'consulta') AND dias_na_fase_atual > 60) OR
  (a.fase_atual = 'producao_de_oculos' AND dias_na_fase_atual > 30)
ORDER BY dias_na_fase_atual DESC;

-- =============================================
-- 12. DISTRIBUIÇÃO POR GÊNERO E FASE
-- =============================================

-- Distribuição de alunos por gênero em cada fase
SELECT 
  fase_atual,
  sexo,
  COUNT(*) as quantidade,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY fase_atual), 2) as percentual_fase
FROM alunos
GROUP BY fase_atual, sexo
ORDER BY fase_atual, sexo;

-- =============================================
-- 13. TOP 10 ESCOLAS COM MAIS ALUNOS
-- =============================================

-- Ranking de escolas por número de alunos
SELECT 
  e.nome as escola_nome,
  m.nome as municipio_nome,
  COUNT(a.id) as total_alunos,
  COUNT(CASE WHEN a.fase_atual = 'entregue' THEN 1 END) as alunos_entregue,
  ROUND(
    COUNT(CASE WHEN a.fase_atual = 'entregue' THEN 1 END) * 100.0 / 
    NULLIF(COUNT(a.id), 0), 
    2
  ) as taxa_conclusao_percentual
FROM escolas e
LEFT JOIN municipios m ON e.municipio_id = m.id
LEFT JOIN alunos a ON a.escola_id = e.id
GROUP BY e.id, e.nome, m.nome
ORDER BY total_alunos DESC
LIMIT 10;

-- =============================================
-- 14. FUNIL DE CONVERSÃO ENTRE FASES
-- =============================================

-- Taxa de conversão entre fases
WITH fase_counts AS (
  SELECT 
    COUNT(CASE WHEN fase_atual = 'triagem' THEN 1 END) as triagem,
    COUNT(CASE WHEN fase_atual = 'consulta' THEN 1 END) as consulta,
    COUNT(CASE WHEN fase_atual = 'producao_de_oculos' THEN 1 END) as producao,
    COUNT(CASE WHEN fase_atual = 'entregue' THEN 1 END) as entregue,
    COUNT(*) as total
  FROM alunos
)
SELECT 
  'Triagem → Consulta' as conversao,
  triagem as de,
  consulta as para,
  ROUND(consulta * 100.0 / NULLIF(triagem + consulta + producao + entregue, 0), 2) as taxa_percentual
FROM fase_counts
UNION ALL
SELECT 
  'Consulta → Produção' as conversao,
  consulta as de,
  producao as para,
  ROUND(producao * 100.0 / NULLIF(consulta + producao + entregue, 0), 2) as taxa_percentual
FROM fase_counts
UNION ALL
SELECT 
  'Produção → Entregue' as conversao,
  producao as de,
  entregue as para,
  ROUND(entregue * 100.0 / NULLIF(producao + entregue, 0), 2) as taxa_percentual
FROM fase_counts;

-- =============================================
-- 15. VIEW MATERIALIZADA PARA PERFORMANCE
-- =============================================

-- Criar uma view materializada para relatórios frequentes
CREATE MATERIALIZED VIEW IF NOT EXISTS relatorio_escola_consolidado AS
SELECT 
  e.id as escola_id,
  e.nome as escola_nome,
  m.nome as municipio_nome,
  m.estado,
  emp.nome_fantasia as empresa_nome,
  COUNT(DISTINCT t.id) as total_turmas,
  COUNT(a.id) as total_alunos,
  COUNT(CASE WHEN a.fase_atual = 'triagem' THEN 1 END) as alunos_triagem,
  COUNT(CASE WHEN a.fase_atual = 'consulta' THEN 1 END) as alunos_consulta,
  COUNT(CASE WHEN a.fase_atual = 'producao_de_oculos' THEN 1 END) as alunos_producao,
  COUNT(CASE WHEN a.fase_atual = 'entregue' THEN 1 END) as alunos_entregue,
  ROUND(
    COUNT(CASE WHEN a.fase_atual = 'entregue' THEN 1 END) * 100.0 / 
    NULLIF(COUNT(a.id), 0), 
    2
  ) as taxa_conclusao_percentual,
  AVG(EXTRACT(YEAR FROM AGE(a.data_nascimento))) as idade_media
FROM escolas e
LEFT JOIN municipios m ON e.municipio_id = m.id
LEFT JOIN empresas emp ON e.empresa_id = emp.id
LEFT JOIN turmas t ON t.escola_id = e.id
LEFT JOIN alunos a ON a.escola_id = e.id
GROUP BY e.id, e.nome, m.nome, m.estado, emp.nome_fantasia;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_relatorio_escola_consolidado_escola_id 
ON relatorio_escola_consolidado(escola_id);

-- Atualizar a view materializada (executar periodicamente ou via trigger)
-- REFRESH MATERIALIZED VIEW relatorio_escola_consolidado;

-- =============================================
-- FIM DAS QUERIES
-- =============================================
