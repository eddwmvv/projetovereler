import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard';
import { DashboardStats } from '@/types';

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
  });
}
