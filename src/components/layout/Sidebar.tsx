import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  MapPin,
  School,
  Users,
  GraduationCap,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  ClipboardList,
  Plus,
  LogOut,
  Package
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useProfile } from '@/hooks/use-profile';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const gerenciamentoItems: NavItem[] = [
  { icon: Building2, label: 'Empresas', href: '/empresas' },
  { icon: FolderKanban, label: 'Projetos', href: '/projetos' },
  { icon: MapPin, label: 'Municípios', href: '/municipios' },
  { icon: School, label: 'Escolas', href: '/escolas' },
  { icon: Users, label: 'Turmas', href: '/turmas' },
];

const outrosItems: NavItem[] = [
  { icon: GraduationCap, label: 'Alunos', href: '/alunos' },
  { icon: Package, label: 'Estoque', href: '/estoque-armacoes' },
  { icon: FileText, label: 'Relatórios', href: '/relatorios' },
];


interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

// Mapear roles para labels em português
const roleLabels: Record<'admin' | 'moderator' | 'user', string> = {
  admin: 'Administrador',
  moderator: 'Moderador',
  user: 'Usuário',
};

export const Sidebar = ({ currentPage, onNavigate }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [gerenCadastrosOpen, setGerenCadastrosOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Verificar se algum item do gerenciamento está ativo
  const isGerenCadastrosActive = gerenciamentoItems.some(item => currentPage === item.href);

  // Abrir automaticamente se algum item do grupo estiver ativo
  useEffect(() => {
    if (isGerenCadastrosActive && !gerenCadastrosOpen && !collapsed) {
      setGerenCadastrosOpen(true);
    }
  }, [isGerenCadastrosActive, collapsed]);

  // Obter informações do usuário
  const userName = profileData?.profile?.nome_completo || user?.email || 'Usuário';
  const userRole = profileData?.primaryRole 
    ? roleLabels[profileData.primaryRole] 
    : 'Carregando...';

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-[#eff6f8] transition-all duration-300 border-r border-gray-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo/Brand */}
      <div className="flex items-center justify-between p-4 border-b border-gray-300 relative">
        {!collapsed && (
          <>
            <div className="flex items-center justify-center flex-1">
              <img 
                src="/logo.svg" 
                alt="Logo Ver e Ler" 
                className="h-16 w-auto transition-all duration-300"
              />
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="absolute right-2 p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-black"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-black flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Dashboard */}
        <button
          onClick={() => onNavigate('/')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
            currentPage === '/'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-700 hover:bg-gray-200 hover:text-black'
          )}
        >
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <span className="font-medium truncate">Dashboard</span>
          )}
        </button>

        {/* GEREN. CADASTROS - Menu Expansível */}
        {!collapsed ? (
          <Collapsible open={gerenCadastrosOpen} onOpenChange={setGerenCadastrosOpen}>
            <CollapsibleTrigger
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200',
                isGerenCadastrosActive
                  ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                  : 'text-gray-700 hover:bg-gray-200 hover:text-black'
              )}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium truncate">Cadastros</span>
              </div>
              {gerenCadastrosOpen ? (
                <ChevronUp className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
              {gerenciamentoItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.href;
                
                return (
                  <button
                    key={item.href}
                    onClick={() => onNavigate(item.href)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ml-4',
                      isActive
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                        : 'text-gray-600 hover:bg-gray-200 hover:text-black'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium truncate text-sm">{item.label}</span>
                  </button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          // Quando collapsed, mostrar apenas o ícone do grupo
          <div className="relative group">
            <button
              className={cn(
                'w-full flex items-center justify-center px-3 py-2.5 rounded-lg transition-all duration-200',
                isGerenCadastrosActive
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-700 hover:bg-gray-200 hover:text-black'
              )}
              title="Cadastros"
            >
              <ClipboardList className="w-5 h-5 flex-shrink-0" />
            </button>
          </div>
        )}

        {/* Outros Itens */}
        {outrosItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPage === item.href;
          // Cores diferentes para cada item
          const colors = [
            { active: 'bg-emerald-500', shadow: 'shadow-emerald-500/30' },
            { active: 'bg-purple-500', shadow: 'shadow-purple-500/30' },
            { active: 'bg-blue-500', shadow: 'shadow-blue-500/30' },
          ];
          const color = colors[index % colors.length];
          
          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? `${color.active} text-white shadow-lg ${color.shadow}`
                  : 'text-gray-700 hover:bg-gray-200 hover:text-black'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}

      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-300">
        <div className={cn(
          'flex items-center gap-3',
          collapsed && 'justify-center'
        )}>
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium text-gray-900 truncate">
                {profileLoading ? 'Carregando...' : userName}
              </span>
              <span className="text-xs text-gray-600 truncate">
                {profileLoading ? 'Carregando...' : userRole}
              </span>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-black"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
