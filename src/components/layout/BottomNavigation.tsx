import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Package, 
  FileText,
  Users 
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

interface BottomNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Início', href: '/' },
  { icon: Users, label: 'Alunos', href: '/alunos' },
  { icon: Package, label: 'Estoque', href: '/estoque-armacoes' },
  { icon: FileText, label: 'Relatórios', href: '/relatorios' },
];

export const BottomNavigation = ({ currentPage, onNavigate }: BottomNavigationProps) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.href;
          
          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                'active:bg-gray-100',
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-600'
              )}
            >
              <Icon 
                className={cn(
                  'w-5 h-5 transition-all',
                  isActive && 'scale-110'
                )} 
              />
              <span className={cn(
                'text-[10px] font-medium',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
