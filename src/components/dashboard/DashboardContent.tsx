import { Building2, FolderKanban, MapPin, School, GraduationCap, AlertCircle, Sun, Briefcase, Users, Building, FileText, Package } from 'lucide-react';
import { StatCard } from './StatCard';
import { RecentStudentsTable } from './RecentStudentsTable';
import { GraficoBarras } from '../relatorios/GraficoBarras';
import { HeatmapPerformance } from './HeatmapPerformance';
import { useDashboardStats } from '@/hooks/use-dashboard';
import { useAlunos } from '@/hooks/use-alunos';
import { useProfile } from '@/hooks/use-profile';
import { StudentPhase } from '@/types';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';

interface DashboardContentProps {
  onNavigate: (page: string) => void;
}

export const DashboardContent = ({ onNavigate }: DashboardContentProps) => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: alunos = [], isLoading: alunosLoading } = useAlunos();
  const { data: profile } = useProfile();

  // Função para obter saudação baseada no horário
  const getSaudacao = () => {
    const hora = new Date().getHours();

    if (hora >= 5 && hora < 12) {
      return 'Bom dia';
    } else if (hora >= 12 && hora < 18) {
      return 'Boa tarde';
    } else if (hora >= 18 && hora < 24) {
      return 'Boa noite';
    } else {
      return 'Boa madrugada';
    }
  };


  // Obter nome do usuário
  const nomeUsuario = profile?.profile?.nome_completo || 'Usuário';


  if (statsLoading || alunosLoading) {
    return <LoadingState variant="dashboard" />;
  }

  if (!stats) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Erro ao carregar dados"
        description="Não foi possível carregar as estatísticas do dashboard. Tente recarregar a página."
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div>
        <h1 className="text-5xl font-bold text-gray-900">
          {getSaudacao()}, <span className="text-blue-600">{nomeUsuario.split(' ')[0]}</span>
        </h1>
        <p className="text-gray-500 text-base mt-2">
          Bem-vindo de volta ao seu painel
        </p>
      </div>

      {/* Key Stats - 2 Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <StatCard
          title="Alunos Cadastrados"
          value={stats.totalAlunos}
          icon={Users}
          subtitle="Total de alunos"
          variant="alunos"
          onClick={() => onNavigate('/alunos')}
        />
        <StatCard
          title="Óculos em Estoque"
          value={1240}
          icon={Package}
          subtitle="Disponíveis"
          variant="projetos"
          onClick={() => onNavigate('/estoque-armacoes')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Barras */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Visão Geral</h3>
              <p className="text-sm text-gray-500 mt-1">Estatísticas do sistema</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 11-4 0 2 2 0 014 0zM10 12a2 2 0 11-4 0 2 2 0 014 0zM10 18a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
          <GraficoBarras
            data={[
              {
                name: 'Empresas',
                value: stats.totalEmpresas,
                color: '#3B82F6'
              },
              {
                name: 'Projetos',
                value: stats.projetosAtivos,
                color: '#10B981'
              },
              {
                name: 'Escolas',
                value: stats.escolasCadastradas,
                color: '#F59E0B'
              },
              {
                name: 'Alunos',
                value: stats.totalAlunos,
                color: '#EF4444'
              }
            ]}
            xLabel=""
            yLabel=""
            height={280}
          />
        </div>

        {/* Distribuição por Gênero */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Distribuição por Gênero</h3>
              <p className="text-sm text-gray-500 mt-1">Dados dos alunos</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 11-4 0 2 2 0 014 0zM10 12a2 2 0 11-4 0 2 2 0 014 0zM10 18a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Masculino</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(stats.totalAlunos * 0.52)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-pink-50 to-pink-50/50 border border-pink-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Feminino</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(stats.totalAlunos * 0.45)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-50/50 border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Outro</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(stats.totalAlunos * 0.03)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <HeatmapPerformance tipo="escola" />
        <HeatmapPerformance tipo="municipio" />
      </div>

      {/* Recent Students Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <RecentStudentsTable students={alunos.slice(0, 5)} />
      </div>
    </div>
  );
};
