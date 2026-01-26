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
import { useDeleteMunicipio } from '@/hooks/use-municipios';
import { Municipio } from '@/types';

interface DeleteMunicipioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  municipio: Municipio | null;
}

export function DeleteMunicipioDialog({ open, onOpenChange, municipio }: DeleteMunicipioDialogProps) {
  const deleteMunicipio = useDeleteMunicipio();

  if (!municipio) return null;

  const handleDelete = async () => {
    try {
      await deleteMunicipio.mutateAsync(municipio.id);
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
            Tem certeza que deseja excluir o município <strong>{municipio.nome} - {municipio.estado}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita. Todos os dados relacionados a este município serão permanentemente removidos, incluindo escolas e alunos vinculados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMunicipio.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMunicipio.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMunicipio.isPending ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
