import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Profile = {
  id: string;
  user_id: string;
  nome_completo: string | null;
  email: string | null;
  empresa_id: string | null;
  created_at: string;
  updated_at: string;
};

type UserRole = {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
};

export type UserProfile = {
  profile: Profile | null;
  roles: UserRole[];
  primaryRole: 'admin' | 'moderator' | 'user' | null;
};

export function useProfile() {
  const { user } = useAuth();

  return useQuery<UserProfile>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return { profile: null, roles: [], primaryRole: null };
      }

      // Buscar profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, que é ok se o profile ainda não foi criado
        throw profileError;
      }

      // Buscar roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .order('role', { ascending: false }); // admin primeiro, depois moderator, depois user

      if (rolesError) {
        throw rolesError;
      }

      // Determinar role primário (admin > moderator > user)
      let primaryRole: 'admin' | 'moderator' | 'user' | null = null;
      if (rolesData && rolesData.length > 0) {
        if (rolesData.some(r => r.role === 'admin')) {
          primaryRole = 'admin';
        } else if (rolesData.some(r => r.role === 'moderator')) {
          primaryRole = 'moderator';
        } else {
          primaryRole = 'user';
        }
      }

      return {
        profile: profileData || null,
        roles: rolesData || [],
        primaryRole,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
