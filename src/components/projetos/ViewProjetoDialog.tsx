import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Projeto } from '@/types';
import { useEmpresas } from '@/hooks/use-empresas';
import { useMunicipios } from '@/hooks/use-municipios';

interface ViewProjetoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projeto: Projeto | null;
}

const statusLabels: Record<string, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  finalizado: 'Finalizado',
};

export function ViewProjetoDialog({ open, onOpenChange, projeto }: ViewProjetoDialogProps) {
  const { data: empresas = [] } = useEmpresas();
  const { data: municipios = [] } = useMunicipios();

  if (!projeto) return null;

  const empresa = empresas.find(e => e.id === projeto.empresaId);
  const municipiosProjeto = municipios.filter(m => projeto.municipiosIds.includes(m.id));

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
          <DialogTitle>Detalhes do Projeto</DialogTitle>
          <DialogDescription>
            Informações completas do projeto cadastrado.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Nome */}
          <div>
            <h3 className="text-lg font-semibold">{projeto.nome}</h3>
          </div>

          <div className="grid gap-4 py-4">
            {/* Informações Básicas */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase">Informações Básicas</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Ano/Ação</p>
                  <p className="text-sm">{projeto.anoAcao}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge 
                    variant={projeto.status === 'ativo' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {statusLabels[projeto.status]}
                  </Badge>
                </div>
              </div>
              {projeto.descricao && (
                <div>
                  <p className="text-sm font-medium">Descrição</p>
                  <p className="text-sm text-muted-foreground">{projeto.descricao}</p>
                </div>
              )}
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase">Empresa</h4>
              <p className="text-sm">{empresa?.nomeFantasia || '-'}</p>
            </div>

            {/* Municípios */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase">Municípios Vinculados</h4>
              {municipiosProjeto.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum município vinculado</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {municipiosProjeto.map((municipio) => (
                    <Badge key={municipio.id} variant="secondary">
                      {municipio.nome} - {municipio.estado}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Data de Cadastro */}
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Cadastrado em {formatDate(projeto.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
