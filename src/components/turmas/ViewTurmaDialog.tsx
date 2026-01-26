import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Turma, Shift } from '@/types';
import { useEscolas } from '@/hooks/use-escolas';

interface ViewTurmaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turma: Turma | null;
}

const turnoLabels: Record<Shift, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  integral: 'Integral',
  noite: 'Noite',
};

const statusLabels: Record<string, string> = {
  ativo: 'Ativa',
  inativo: 'Inativa',
  finalizado: 'Finalizada',
};

export function ViewTurmaDialog({ open, onOpenChange, turma }: ViewTurmaDialogProps) {
  const { data: escolas = [] } = useEscolas();

  if (!turma) return null;

  const escola = escolas.find(e => e.id === turma.escolaId);

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
          <DialogTitle>Detalhes da Turma</DialogTitle>
          <DialogDescription>
            Informações completas da turma cadastrada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Nome */}
          <div>
            <h3 className="text-lg font-semibold">{turma.nome}</h3>
          </div>

          <div className="grid gap-4 py-4">
            {/* Informações Básicas */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase">Informações Básicas</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Série</p>
                  <p className="text-sm">{turma.serie}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Turno</p>
                  <p className="text-sm">{turnoLabels[turma.turno]}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Ano Letivo</p>
                  <p className="text-sm">{turma.anoLetivo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge 
                    variant={turma.status === 'ativo' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {statusLabels[turma.status]}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Escola */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase">Escola</h4>
              <p className="text-sm">{escola?.nome || '-'}</p>
            </div>

            {/* Data de Cadastro */}
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Cadastrada em {formatDate(turma.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
