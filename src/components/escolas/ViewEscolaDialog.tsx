import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Escola } from '@/types';
import { useMunicipios } from '@/hooks/use-municipios';
import { useEmpresas } from '@/hooks/use-empresas';
import { useProjetos } from '@/hooks/use-projetos';

interface ViewEscolaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escola: Escola | null;
}

export function ViewEscolaDialog({ open, onOpenChange, escola }: ViewEscolaDialogProps) {
  const { data: municipios = [] } = useMunicipios();
  const { data: empresas = [] } = useEmpresas();
  const { data: projetos = [] } = useProjetos();

  if (!escola) return null;

  const municipio = municipios.find(m => m.id === escola.municipioId);
  const empresa = empresas.find(e => e.id === escola.empresaId);
  const projetosEscola = projetos.filter(p => escola.projetosIds.includes(p.id));

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
          <DialogTitle>Detalhes da Escola</DialogTitle>
          <DialogDescription>
            Informações completas da escola cadastrada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Nome */}
          <div>
            <h3 className="text-lg font-semibold">{escola.nome}</h3>
          </div>

          <div className="grid gap-4 py-4">
            {/* Localização */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase">Localização</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Cidade</p>
                  <p className="text-sm">{municipio ? `${municipio.nome} - ${municipio.estado}` : '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Empresa</p>
                  <p className="text-sm">{empresa?.nomeFantasia || '-'}</p>
                </div>
              </div>
            </div>

            {/* Projetos */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase">Projetos Vinculados</h4>
              {projetosEscola.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum projeto vinculado</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {projetosEscola.map((projeto) => (
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
                Cadastrada em {formatDate(escola.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
