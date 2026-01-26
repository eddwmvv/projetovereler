-- =============================================
-- DESABILITAR RLS TEMPORARIAMENTE (APENAS DESENVOLVIMENTO)
-- =============================================
-- ⚠️ ATENÇÃO: Use isso APENAS para desenvolvimento!
-- NUNCA use isso em produção sem políticas RLS adequadas!
-- =============================================
-- Execute este script se você ainda tiver problemas
-- após executar o fix-rls-complete.sql
-- =============================================

ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipio_projetos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.escolas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.escola_projetos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_fases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- =============================================
-- Para verificar se RLS está desabilitado:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('empresas', 'projetos', 'municipios', 'escolas', 'turmas', 'alunos');
-- =============================================
