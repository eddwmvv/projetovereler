import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { EmpresasPage } from '@/pages/EmpresasPage';
import { ProjetosPage } from '@/pages/ProjetosPage';
import { MunicipiosPage } from '@/pages/MunicipiosPage';
import { EscolasPage } from '@/pages/EscolasPage';
import { TurmasPage } from '@/pages/TurmasPage';
import { AlunosPage } from '@/pages/AlunosPage';
import { RelatoriosPage } from '@/pages/RelatoriosPage';
import { EstoqueArmacoesPage } from '@/pages/EstoqueArmacoesPage';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('/');

  const renderContent = () => {
    switch (currentPage) {
      case '/':
        return <DashboardContent onNavigate={setCurrentPage} />;
      case '/empresas':
        return <EmpresasPage />;
      case '/projetos':
        return <ProjetosPage />;
      case '/municipios':
        return <MunicipiosPage />;
      case '/escolas':
        return <EscolasPage />;
      case '/turmas':
        return <TurmasPage />;
      case '/alunos':
        return <AlunosPage />;
      case '/estoque-armacoes':
        return <EstoqueArmacoesPage />;
      case '/relatorios':
        return <RelatoriosPage />;
      default:
        return <DashboardContent onNavigate={setCurrentPage} />;
    }
  };

  return (
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default Index;
