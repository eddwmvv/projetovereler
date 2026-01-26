import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nomeCompleto?: string, funcao?: 'admin' | 'moderator' | 'user') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, nomeCompleto?: string, funcao: 'admin' | 'moderator' | 'user' = 'user') => {
    try {
      // Primeiro, fazer o cadastro no Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome_completo: nomeCompleto,
            funcao: funcao, // Salvar a função nos metadados do usuário
          },
        },
      });

      if (authError) {
        return { error: authError };
      }

      // Se o cadastro foi bem-sucedido, criar o perfil e role
      if (data.user) {
        try {
          // Criar o perfil na tabela profiles
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              nome_completo: nomeCompleto,
              email: email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (profileError) {
            console.error('Erro ao criar perfil:', profileError);
            // Não retorna erro aqui pois o usuário já foi criado no Auth
          }

          // Criar o role na tabela user_roles
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: funcao,
              created_at: new Date().toISOString(),
            });

          if (roleError) {
            console.error('Erro ao criar role:', roleError);
            // Não retorna erro aqui pois o perfil já foi criado
          }

        } catch (dbError) {
          console.error('Erro ao criar perfil/role:', dbError);
          // Não retorna erro pois o usuário já foi criado no Auth
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
