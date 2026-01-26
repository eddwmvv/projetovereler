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
import { useDeleteEscola } from '@/hooks/use-escolas';
import { Escola } from '@/types';

interface DeleteEscolaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escola: Escola | null;
}

export function DeleteEscolaDialog({ open, onOpenChange, escola }: DeleteEscolaDialogProps) {
  const deleteEscola = useDeleteEscola();

  if (!escola) return null;

  const handleDelete = async () => {
    try {
      await deleteEscola.mutateAsync(escola.id);
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
            Tem certeza que deseja excluir a escola <strong>{escola.nome}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita. Todos os dados relacionados a esta escola serão permanentemente removidos, incluindo turmas e alunos vinculados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteEscola.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteEscola.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteEscola.isPending ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
