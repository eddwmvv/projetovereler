import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Empresa } from '@/types';

interface ViewEmpresaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: Empresa | null;
}

const statusLabels: Record<string, string> = {
  ativo: 'Ativa',
  inativo: 'Inativa',
  finalizado: 'Finalizada',
};

export function ViewEmpresaDialog({ open, onOpenChange, empresa }: ViewEmpresaDialogProps) {
  if (!empresa) return null;

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
          <DialogTitle>Detalhes da Empresa</DialogTitle>
          <DialogDescription>
            Informações completas da empresa cadastrada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Nome */}
          <div>
            <h3 className="text-lg font-semibold">{empresa.nomeFantasia}</h3>
          </div>

          <div className="grid gap-4 py-4">
            {/* Informações Básicas */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase">Informações Básicas</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Nome Fantasia</p>
                  <p className="text-sm">{empresa.nomeFantasia}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Razão Social</p>
                  <p className="text-sm">{empresa.razaoSocial}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">CNPJ</p>
                  <p className="text-sm">{empresa.cnpj}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge 
                    variant={empresa.status === 'ativo' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {statusLabels[empresa.status]}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Data de Cadastro */}
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Cadastrada em {formatDate(empresa.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
