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
  ChevronDown,
  ChevronUp,
  LogOut,
  Package,
  X,
  Boxes,
  ClipboardList
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
  { icon: Boxes, label: 'Lotes', href: '/lotes' },
  { icon: FileText, label: 'Relatórios', href: '/relatorios' },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

const roleLabels: Record<'admin' | 'moderator' | 'user', string> = {
  admin: 'Administrador',
  moderator: 'Moderador',
  user: 'Usuário',
};

export const Sidebar = ({ currentPage, onNavigate, isOpen = true, onClose, isMobile = false }: SidebarProps) => {
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

  const handleNavigate = (page: string) => {
    onNavigate(page);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const isGerenCadastrosActive = gerenciamentoItems.some(item => currentPage === item.href);

  useEffect(() => {
    if (isGerenCadastrosActive && !gerenCadastrosOpen) {
      setGerenCadastrosOpen(true);
    }
  }, [isGerenCadastrosActive]);

  const userName = profileData?.profile?.nome_completo || user?.email || 'Usuário';
  const userRole = profileData?.primaryRole 
    ? roleLabels[profileData.primaryRole] 
    : 'Carregando...';

  // ===== RENDER DESKTOP (HEADER HORIZONTAL) =====
  if (!isMobile) {
    return (
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-8 py-5 flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src="/logo.svg" alt="Ver e Ler" className="h-10 w-auto" />
          </div>

          {/* Navigation - Center */}
          <nav className="flex-1 flex items-center justify-center gap-8">
            {/* Dashboard */}
            <button
              onClick={() => handleNavigate('/')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm whitespace-nowrap',
                currentPage === '/'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            {/* Cadastros Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setGerenCadastrosOpen(!gerenCadastrosOpen)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm whitespace-nowrap',
                  gerenCadastrosOpen || isGerenCadastrosActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <ClipboardList className="w-4 h-4" />
                Cadastros
              </button>

              {/* Dropdown Menu */}
              {gerenCadastrosOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[220px]">
                  <div className="py-2 flex flex-col">
                    {gerenciamentoItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentPage === item.href;
                      
                      return (
                        <button
                          key={item.href}
                          onClick={() => {
                            handleNavigate(item.href);
                            setGerenCadastrosOpen(false);
                          }}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2.5 transition-colors font-medium text-sm w-full text-left',
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          )}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Outros Itens */}
            {outrosItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.href;
              
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigate(item.href)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm whitespace-nowrap',
                    isActive
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile - Right */}
          <div className="flex items-center gap-4 flex-shrink-0 ml-8">
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col min-w-0 text-right">
                <span className="font-medium text-gray-900 text-xs truncate">
                  {profileLoading ? '...' : userName.split(' ')[0]}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {profileLoading ? '...' : userRole}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ===== RENDER MOBILE (SIDEBAR LATERAL) =====
  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          'flex flex-col h-screen bg-white transition-all duration-300 border-r border-gray-200 shadow-lg',
          'fixed top-0 left-0 z-50 w-64',
          isMobile && !isOpen && '-translate-x-full',
          isMobile && isOpen && 'translate-x-0'
        )}
      >
        {/* Logo/Brand */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
          {isMobile && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">VL</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Ver e Ler</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {/* Dashboard */}
          <button
            onClick={() => handleNavigate('/')}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm',
              currentPage === '/'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            Dashboard
          </button>

          {/* CADASTROS - Menu Expansível */}
          <Collapsible open={gerenCadastrosOpen} onOpenChange={setGerenCadastrosOpen}>
            <CollapsibleTrigger
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors font-medium text-sm',
                isGerenCadastrosActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 flex-shrink-0" />
                <span>Cadastros</span>
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
                    onClick={() => handleNavigate(item.href)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors font-medium text-sm ml-4',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </CollapsibleContent>
          </Collapsible>

          {/* Outros Itens */}
          {outrosItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.href;
            
            return (
              <button
                key={item.href}
                onClick={() => handleNavigate(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium text-gray-900 text-sm truncate">
                {profileLoading ? 'Carregando...' : userName}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {profileLoading ? 'Carregando...' : userRole}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
