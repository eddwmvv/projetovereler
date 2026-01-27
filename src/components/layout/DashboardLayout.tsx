import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNavigation } from './BottomNavigation';
import { useMobileSidebar } from '@/hooks/use-mobile-sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const DashboardLayout = ({
  children,
  currentPage,
  onNavigate,
}: DashboardLayoutProps) => {
  const { isMobile } = useMobileSidebar();
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar apenas para desktop */}
      {!isMobile && (
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={onNavigate}
          isOpen={true}
          isMobile={false}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background pb-20 lg:pb-6">
          {children}
        </main>
        
        {/* Bottom Navigation apenas para mobile */}
        <BottomNavigation 
          currentPage={currentPage}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
};
