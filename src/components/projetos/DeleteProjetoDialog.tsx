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
import { useDeleteProjeto } from '@/hooks/use-projetos';
import { Projeto } from '@/types';

interface DeleteProjetoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projeto: Projeto | null;
}

export function DeleteProjetoDialog({ open, onOpenChange, projeto }: DeleteProjetoDialogProps) {
  const deleteProjeto = useDeleteProjeto();

  if (!projeto) return null;

  const handleDelete = async () => {
    try {
      await deleteProjeto.mutateAsync(projeto.id);
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
            Tem certeza que deseja excluir o projeto <strong>{projeto.nome}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita. Todos os dados relacionados a este projeto serão permanentemente removidos, incluindo escolas e alunos vinculados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteProjeto.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteProjeto.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteProjeto.isPending ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
