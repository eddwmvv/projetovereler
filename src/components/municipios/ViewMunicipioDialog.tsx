import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Municipio } from '@/types';
import { useProjetos } from '@/hooks/use-projetos';

interface ViewMunicipioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  municipio: Municipio | null;
}

export function ViewMunicipioDialog({ open, onOpenChange, municipio }: ViewMunicipioDialogProps) {
  const { data: projetos = [] } = useProjetos();

  if (!municipio) return null;

  const projetosMunicipio = projetos.filter(p => municipio.projetosIds.includes(p.id));

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Município</DialogTitle>
          <DialogDescription>
            Informações completas do município cadastrado.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Nome */}
          <div>
            <h3 className="text-lg font-semibold">{municipio.nome} - {municipio.estado}</h3>
          </div>

          <div className="grid gap-4 py-4">
            {/* Localização */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase">Localização</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Município</p>
                  <p className="text-sm">{municipio.nome}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Estado</p>
                  <p className="text-sm">{municipio.estado}</p>
                </div>
              </div>
            </div>

            {/* Projetos */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase">Projetos Vinculados</h4>
              {projetosMunicipio.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum projeto vinculado</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {projetosMunicipio.map((projeto) => (
                    <Badge key={projeto.id} variant="secondary">
                      {projeto.nome}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Data de Cadastro */}
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Cadastrado em {formatDate(municipio.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
