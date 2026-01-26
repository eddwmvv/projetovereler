import { Building2, FolderKanban, MapPin, School, GraduationCap, AlertCircle, Sun, Briefcase, Users, Building } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Saudação e Título lado a lado */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex-1">
          <h1 className="text-heading-lg text-left">
            {getSaudacao()}, <span className="text-blue-600 dark:text-blue-400">{nomeUsuario}</span>
          </h1>
        </div>
        <div className="flex-1 text-right">
          <h2 className="text-heading-md text-muted-foreground">Visão Geral do Sistema</h2>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Empresas"
          value={stats.totalEmpresas}
          icon={Briefcase}
          subtitle="Parceiras"
          variant="empresas"
          onClick={() => onNavigate('/empresas')}
        />
        <StatCard
          title="Projetos Ativos"
          value={stats.projetosAtivos}
          icon={FolderKanban}
          subtitle="Em andamento"
          variant="projetos"
          onClick={() => onNavigate('/projetos')}
        />
        <StatCard
          title="Municípios"
          value={stats.municipiosAtendidos}
          icon={Building}
          subtitle="Atendidos"
          variant="municipios"
          onClick={() => onNavigate('/municipios')}
        />
        <StatCard
          title="Escolas"
          value={stats.escolasCadastradas}
          icon={School}
          subtitle="Cadastradas"
          variant="escolas"
          onClick={() => onNavigate('/escolas')}
        />
        <StatCard
          title="Total de Alunos"
          value={stats.totalAlunos}
          icon={Users}
          subtitle="Cadastrados"
          variant="alunos"
          onClick={() => onNavigate('/alunos')}
        />
      </div>

      {/* Gráficos Interativos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card rounded-lg p-6 border">
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
            title="Visão Geral do Sistema"
            xLabel="Entidades"
            yLabel="Quantidade"
            height={300}
          />
        </div>
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Gênero</h3>
          <div className="space-y-4">
            {/* Simulação de dados - em produção isso viria da API */}
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-blue-900 dark:text-blue-100">Masculino</span>
              </div>
              <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {Math.round(stats.totalAlunos * 0.52)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-950/30 rounded-lg border border-pink-200 dark:border-pink-800">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
                <span className="font-medium text-pink-900 dark:text-pink-100">Feminino</span>
              </div>
              <span className="text-2xl font-bold text-pink-900 dark:text-pink-100">
                {Math.round(stats.totalAlunos * 0.45)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <span className="font-medium text-purple-900 dark:text-purple-100">Outro</span>
              </div>
              <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {Math.round(stats.totalAlunos * 0.03)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de Alunos</span>
                <span className="font-semibold">{stats.totalAlunos}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmaps de Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <HeatmapPerformance tipo="escola" />
        <HeatmapPerformance tipo="municipio" />
      </div>

      {/* Recent Students Table */}
      <div>
        <RecentStudentsTable students={alunos.slice(0, 5)} />
      </div>
    </div>
  );
};
