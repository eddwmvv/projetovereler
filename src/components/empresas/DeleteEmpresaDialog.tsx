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
import { useDeleteEmpresa } from '@/hooks/use-empresas';
import { Empresa } from '@/types';

interface DeleteEmpresaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: Empresa | null;
}

export function DeleteEmpresaDialog({ open, onOpenChange, empresa }: DeleteEmpresaDialogProps) {
  const deleteEmpresa = useDeleteEmpresa();

  if (!empresa) return null;

  const handleDelete = async () => {
    try {
      await deleteEmpresa.mutateAsync(empresa.id);
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
            Tem certeza que deseja excluir a empresa <strong>{empresa.nomeFantasia}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita. Todos os dados relacionados a esta empresa serão permanentemente removidos, incluindo projetos, escolas e alunos vinculados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteEmpresa.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteEmpresa.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteEmpresa.isPending ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
