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
import { useDeleteTurma } from '@/hooks/use-turmas';
import { Turma } from '@/types';

interface DeleteTurmaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turma: Turma | null;
}

export function DeleteTurmaDialog({ open, onOpenChange, turma }: DeleteTurmaDialogProps) {
  const deleteTurma = useDeleteTurma();

  if (!turma) return null;

  const handleDelete = async () => {
    try {
      await deleteTurma.mutateAsync(turma.id);
      onOpenChange(false);
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a turma <strong>{turma.nome}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita. Todos os dados relacionados a esta turma serão permanentemente removidos, incluindo alunos vinculados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTurma.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteTurma.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteTurma.isPending ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
