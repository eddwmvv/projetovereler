import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, 
  Building2, 
  FolderPlus, 
  School,
  FileText,
  Download
} from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (page: string) => void;
}

export const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  const actions = [
    {
      icon: UserPlus,
      label: 'Novo Aluno',
      description: 'Cadastrar aluno',
      onClick: () => onNavigate('/alunos'),
    },
    {
      icon: Building2,
      label: 'Nova Empresa',
      description: 'Cadastrar empresa',
      onClick: () => onNavigate('/empresas'),
    },
    {
      icon: FolderPlus,
      label: 'Novo Projeto',
      description: 'Criar projeto',
      onClick: () => onNavigate('/projetos'),
    },
    {
      icon: School,
      label: 'Nova Escola',
      description: 'Cadastrar escola',
      onClick: () => onNavigate('/escolas'),
    },
    {
      icon: FileText,
      label: 'Relatórios',
      description: 'Ver relatórios',
      onClick: () => onNavigate('/relatorios'),
    },
    {
      icon: Download,
      label: 'Exportar',
      description: 'Exportar dados',
      onClick: () => onNavigate('/relatorios'),
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30"
                onClick={action.onClick}
              >
                <Icon className="w-5 h-5 text-primary" />
                <div className="text-center">
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
