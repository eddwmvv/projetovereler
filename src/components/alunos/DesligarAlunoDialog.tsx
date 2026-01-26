import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Aluno } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DesligarAlunoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aluno: Aluno | null;
}

export function DesligarAlunoDialog({ open, onOpenChange, aluno }: DesligarAlunoDialogProps) {
  const [motivo, setMotivo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (!aluno) return null;

  const handleDesligar = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .rpc('desligar_aluno', {
          aluno_id: aluno.id,
          user_id: user.id,
          motivo: motivo.trim() || null
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Aluno desligado com sucesso. Os dados foram preservados.',
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao desligar aluno',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Desligar Aluno</AlertDialogTitle>
          <AlertDialogDescription>
            O aluno <strong>{aluno.nomeCompleto}</strong> será marcado como inativo.
            <br />
            <br />
            Todos os dados serão preservados e o aluno poderá ser reativado posteriormente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="motivo" className="text-sm font-medium">
              Motivo do Desligamento (Opcional)
            </Label>
            <Textarea
              id="motivo"
              placeholder="Descreva o motivo..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDesligar}
            disabled={isLoading}
            className="bg-amber-600 text-white hover:bg-amber-700"
          >
            {isLoading ? 'Desligando...' : 'Desligar Aluno'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}