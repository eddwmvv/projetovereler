-- =============================================
-- SISTEMA VER E LER - CRIAÇÃO DO BANCO DE DADOS
-- =============================================
-- Execute este script no SQL Editor do Supabase
-- https://app.supabase.com/project/[seu-projeto]/sql/new
-- 
-- NOTA: Este script é idempotente - pode ser executado múltiplas vezes
-- sem causar erros. Tipos, triggers e índices são criados apenas se não existirem.
-- =============================================

-- =============================================
-- ENUMS
-- =============================================
-- Criar tipos ENUM apenas se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_type') THEN
    CREATE TYPE public.status_type AS ENUM ('ativo', 'inativo', 'finalizado');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_phase') THEN
    CREATE TYPE public.student_phase AS ENUM ('triagem', 'consulta', 'producao_de_oculos', 'entregue');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_phase_status') THEN
    CREATE TYPE public.student_phase_status AS ENUM ('pendente', 'aprovado', 'reprovado', 'nao_elegivel');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_type') THEN
    CREATE TYPE public.shift_type AS ENUM ('manha', 'tarde', 'integral', 'noite');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
    CREATE TYPE public.gender_type AS ENUM ('masculino', 'feminino', 'outro', 'nao_informado');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

-- =============================================
-- FUNÇÃO PARA ATUALIZAR TIMESTAMPS
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =============================================
-- TABELA: EMPRESAS
-- =============================================
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_fantasia TEXT NOT NULL,
  razao_social TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  status status_type NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_empresas_updated_at ON public.empresas;
CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABELA: PROJETOS
-- =============================================
CREATE TABLE IF NOT EXISTS public.projetos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  status status_type NOT NULL DEFAULT 'ativo',
  ano_acao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_projetos_updated_at ON public.projetos;
CREATE TRIGGER update_projetos_updated_at
  BEFORE UPDATE ON public.projetos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABELA: MUNICÍPIOS
-- =============================================
CREATE TABLE IF NOT EXISTS public.municipios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  estado TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_municipios_updated_at ON public.municipios;
CREATE TRIGGER update_municipios_updated_at
  BEFORE UPDATE ON public.municipios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABELA DE RELACIONAMENTO: MUNICÍPIOS <-> PROJETOS
-- =============================================
CREATE TABLE IF NOT EXISTS public.municipio_projetos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  municipio_id UUID NOT NULL REFERENCES public.municipios(id) ON DELETE CASCADE,
  projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(municipio_id, projeto_id)
);

-- =============================================
-- TABELA: ESCOLAS
-- =============================================
CREATE TABLE IF NOT EXISTS public.escolas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  municipio_id UUID NOT NULL REFERENCES public.municipios(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_escolas_updated_at ON public.escolas;
CREATE TRIGGER update_escolas_updated_at
  BEFORE UPDATE ON public.escolas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABELA DE RELACIONAMENTO: ESCOLAS <-> PROJETOS
-- =============================================
CREATE TABLE IF NOT EXISTS public.escola_projetos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID NOT NULL REFERENCES public.escolas(id) ON DELETE CASCADE,
  projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(escola_id, projeto_id)
);

-- =============================================
-- TABELA: TURMAS
-- =============================================
CREATE TABLE IF NOT EXISTS public.turmas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  serie TEXT NOT NULL,
  turno shift_type NOT NULL,
  ano_letivo TEXT NOT NULL,
  status status_type NOT NULL DEFAULT 'ativo',
  escola_id UUID NOT NULL REFERENCES public.escolas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_turmas_updated_at ON public.turmas;
CREATE TRIGGER update_turmas_updated_at
  BEFORE UPDATE ON public.turmas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABELA: ALUNOS
-- =============================================
CREATE TABLE IF NOT EXISTS public.alunos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  sexo gender_type NOT NULL DEFAULT 'nao_informado',
  data_nascimento DATE NOT NULL,
  responsavel_legal TEXT NOT NULL,
  observacao TEXT,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE RESTRICT,
  escola_id UUID NOT NULL REFERENCES public.escolas(id) ON DELETE RESTRICT,
  municipio_id UUID NOT NULL REFERENCES public.municipios(id) ON DELETE RESTRICT,
  projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE RESTRICT,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE RESTRICT,
  fase_atual student_phase NOT NULL DEFAULT 'triagem',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_alunos_updated_at ON public.alunos;
CREATE TRIGGER update_alunos_updated_at
  BEFORE UPDATE ON public.alunos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABELA: HISTÓRICO DE FASES DO ALUNO
-- =============================================
CREATE TABLE IF NOT EXISTS public.historico_fases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  fase student_phase NOT NULL,
  status student_phase_status NOT NULL DEFAULT 'pendente',
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT,
  motivo_interrupcao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABELA: PROFILES (para dados adicionais de usuários)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  nome_completo TEXT,
  email TEXT,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABELA: USER ROLES (para controle de acesso)
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- =============================================
-- FUNÇÃO: VERIFICAR ROLE DO USUÁRIO
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =============================================
-- FUNÇÃO: CRIAR PROFILE AUTOMÁTICO NO SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- TRIGGER: AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_projetos_empresa ON public.projetos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_municipio_projetos_projeto ON public.municipio_projetos(projeto_id);
CREATE INDEX IF NOT EXISTS idx_municipio_projetos_municipio ON public.municipio_projetos(municipio_id);
CREATE INDEX IF NOT EXISTS idx_municipio_projetos_composite ON public.municipio_projetos(projeto_id, municipio_id);
CREATE INDEX IF NOT EXISTS idx_escolas_municipio ON public.escolas(municipio_id);
CREATE INDEX IF NOT EXISTS idx_escolas_empresa ON public.escolas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_turmas_escola ON public.turmas(escola_id);
CREATE INDEX IF NOT EXISTS idx_alunos_turma ON public.alunos(turma_id);
CREATE INDEX IF NOT EXISTS idx_alunos_escola ON public.alunos(escola_id);
CREATE INDEX IF NOT EXISTS idx_alunos_municipio ON public.alunos(municipio_id);
CREATE INDEX IF NOT EXISTS idx_alunos_projeto ON public.alunos(projeto_id);
CREATE INDEX IF NOT EXISTS idx_alunos_empresa ON public.alunos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_alunos_fase ON public.alunos(fase_atual);
CREATE INDEX IF NOT EXISTS idx_historico_aluno ON public.historico_fases(aluno_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_empresa ON public.profiles(empresa_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);

-- =============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- =============================================
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipio_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escola_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_fases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: PROFILES
-- =============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES: USER_ROLES
-- =============================================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES: EMPRESAS
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view empresas" ON public.empresas;
CREATE POLICY "Authenticated users can view empresas"
  ON public.empresas FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert empresas" ON public.empresas;
CREATE POLICY "Authenticated users can insert empresas"
  ON public.empresas FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update empresas" ON public.empresas;
CREATE POLICY "Authenticated users can update empresas"
  ON public.empresas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete empresas" ON public.empresas;
CREATE POLICY "Authenticated users can delete empresas"
  ON public.empresas FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES: PROJETOS
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view projetos" ON public.projetos;
CREATE POLICY "Authenticated users can view projetos"
  ON public.projetos FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert projetos" ON public.projetos;
CREATE POLICY "Authenticated users can insert projetos"
  ON public.projetos FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update projetos" ON public.projetos;
CREATE POLICY "Authenticated users can update projetos"
  ON public.projetos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete projetos" ON public.projetos;
CREATE POLICY "Authenticated users can delete projetos"
  ON public.projetos FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES: MUNICIPIOS
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view municipios" ON public.municipios;
CREATE POLICY "Authenticated users can view municipios"
  ON public.municipios FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert municipios" ON public.municipios;
CREATE POLICY "Authenticated users can insert municipios"
  ON public.municipios FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update municipios" ON public.municipios;
CREATE POLICY "Authenticated users can update municipios"
  ON public.municipios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete municipios" ON public.municipios;
CREATE POLICY "Authenticated users can delete municipios"
  ON public.municipios FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES: MUNICIPIO_PROJETOS
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view municipio_projetos" ON public.municipio_projetos;
CREATE POLICY "Authenticated users can view municipio_projetos"
  ON public.municipio_projetos FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert municipio_projetos" ON public.municipio_projetos;
CREATE POLICY "Authenticated users can insert municipio_projetos"
  ON public.municipio_projetos FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update municipio_projetos" ON public.municipio_projetos;
CREATE POLICY "Authenticated users can update municipio_projetos"
  ON public.municipio_projetos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete municipio_projetos" ON public.municipio_projetos;
CREATE POLICY "Authenticated users can delete municipio_projetos"
  ON public.municipio_projetos FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES: ESCOLAS
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view escolas" ON public.escolas;
CREATE POLICY "Authenticated users can view escolas"
  ON public.escolas FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert escolas" ON public.escolas;
CREATE POLICY "Authenticated users can insert escolas"
  ON public.escolas FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update escolas" ON public.escolas;
CREATE POLICY "Authenticated users can update escolas"
  ON public.escolas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete escolas" ON public.escolas;
CREATE POLICY "Authenticated users can delete escolas"
  ON public.escolas FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES: ESCOLA_PROJETOS
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view escola_projetos" ON public.escola_projetos;
CREATE POLICY "Authenticated users can view escola_projetos"
  ON public.escola_projetos FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert escola_projetos" ON public.escola_projetos;
CREATE POLICY "Authenticated users can insert escola_projetos"
  ON public.escola_projetos FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update escola_projetos" ON public.escola_projetos;
CREATE POLICY "Authenticated users can update escola_projetos"
  ON public.escola_projetos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete escola_projetos" ON public.escola_projetos;
CREATE POLICY "Authenticated users can delete escola_projetos"
  ON public.escola_projetos FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES: TURMAS
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view turmas" ON public.turmas;
CREATE POLICY "Authenticated users can view turmas"
  ON public.turmas FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert turmas" ON public.turmas;
CREATE POLICY "Authenticated users can insert turmas"
  ON public.turmas FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update turmas" ON public.turmas;
CREATE POLICY "Authenticated users can update turmas"
  ON public.turmas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete turmas" ON public.turmas;
CREATE POLICY "Authenticated users can delete turmas"
  ON public.turmas FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES: ALUNOS
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view alunos" ON public.alunos;
CREATE POLICY "Authenticated users can view alunos"
  ON public.alunos FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert alunos" ON public.alunos;
CREATE POLICY "Authenticated users can insert alunos"
  ON public.alunos FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update alunos" ON public.alunos;
CREATE POLICY "Authenticated users can update alunos"
  ON public.alunos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete alunos" ON public.alunos;
CREATE POLICY "Authenticated users can delete alunos"
  ON public.alunos FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- RLS POLICIES: HISTORICO_FASES
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view historico_fases" ON public.historico_fases;
CREATE POLICY "Authenticated users can view historico_fases"
  ON public.historico_fases FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert historico_fases" ON public.historico_fases;
CREATE POLICY "Authenticated users can insert historico_fases"
  ON public.historico_fases FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update historico_fases" ON public.historico_fases;
CREATE POLICY "Authenticated users can update historico_fases"
  ON public.historico_fases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete historico_fases" ON public.historico_fases;
CREATE POLICY "Authenticated users can delete historico_fases"
  ON public.historico_fases FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- FIM DO SCRIPT
-- =============================================
-- ✅ Banco de dados criado com sucesso!
-- 
-- Próximos passos:
-- 1. Configure as variáveis de ambiente no seu projeto:
--    - VITE_SUPABASE_URL
--    - VITE_SUPABASE_PUBLISHABLE_KEY
-- 
-- 2. No Supabase Dashboard, vá em Settings > API para obter essas informações
-- =============================================
