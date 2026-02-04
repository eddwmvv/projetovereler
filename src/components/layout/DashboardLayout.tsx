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
  const { isMobile, isOpen, close } = useMobileSidebar();
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header/Navbar apenas para desktop */}
      {!isMobile && (
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={onNavigate}
          isOpen={true}
          isMobile={false}
        />
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar apenas para mobile */}
        {isMobile && (
          <Sidebar 
            currentPage={currentPage} 
            onNavigate={onNavigate}
            isOpen={isOpen}
            isMobile={true}
            onClose={close}
          />
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-6 md:p-8 pb-20 lg:pb-6">
            {children}
          </main>
          
          {/* Bottom Navigation apenas para mobile */}
          <BottomNavigation 
            currentPage={currentPage}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
};
