import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver autenticado
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eff6f8]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: 'Erro ao fazer login',
          description: error.message || 'Credenciais inválidas',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo ao sistema',
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao fazer login',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#eff6f8]">
      {/* Left Section - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-12">
            <img src="/logo.svg" alt="Ver e Ler" className="w-auto" style={{ height: '9rem' }} />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                E-mail<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: jane@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-12 bg-white border-2 border-gray-300 text-gray-900 !text-base md:!text-base placeholder:text-gray-500 focus-visible:border-[#1D5A7A] focus-visible:ring-2 focus-visible:ring-[#1D5A7A]/20 rounded-md px-4 transition-all font-normal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                Senha<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-12 bg-white border-2 border-gray-300 text-gray-900 !text-base md:!text-base placeholder:text-gray-500 focus-visible:border-[#1D5A7A] focus-visible:ring-2 focus-visible:ring-[#1D5A7A]/20 rounded-md px-4 transition-all font-normal"
              />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="keepLoggedIn"
                checked={keepLoggedIn}
                onCheckedChange={(checked) => setKeepLoggedIn(checked === true)}
                className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
              />
              <Label
                htmlFor="keepLoggedIn"
                className="text-sm font-normal text-gray-700 cursor-pointer leading-none"
              >
                Manter-me conectado neste dispositivo
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#1D5A7A] hover:bg-[#164A5F] text-white font-medium text-base rounded-md shadow-sm transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>
      </div>

      {/* Right Section - Banner Image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden">
        <img 
          src="/bannerlogin.jpg" 
          alt="Banner de login" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
