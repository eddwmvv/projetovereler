import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateMunicipio, useMunicipio } from '@/hooks/use-municipios';
import { useProjetos } from '@/hooks/use-projetos';
import { Checkbox } from '@/components/ui/checkbox';

interface EditMunicipioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  municipioId: string | null;
}

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function EditMunicipioForm({ open, onOpenChange, municipioId }: EditMunicipioFormProps) {
  const [nome, setNome] = useState('');
  const [estado, setEstado] = useState('');
  const [projetosSelecionados, setProjetosSelecionados] = useState<string[]>([]);
  
  const updateMunicipio = useUpdateMunicipio();
  const { data: municipio, isLoading: municipioLoading } = useMunicipio(municipioId || '');
  const { data: projetos = [] } = useProjetos();

  // Preencher formulário quando município for carregado
  useEffect(() => {
    if (municipio) {
      setNome(municipio.nome);
      setEstado(municipio.estado);
      setProjetosSelecionados(municipio.projetosIds || []);
    }
  }, [municipio]);

  // Resetar formulário quando dialog fechar
  useEffect(() => {
    if (!open) {
      setNome('');
      setEstado('');
      setProjetosSelecionados([]);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!municipioId || !estado) return;
    
    try {
      await updateMunicipio.mutateAsync({
        id: municipioId,
        data: {
          nome,
          estado,
          projetosIds: projetosSelecionados,
        },
      });
      onOpenChange(false);
    } catch (error) {
      // Error já é tratado no hook
    }
  };

  const toggleProjeto = (projetoId: string) => {
    setProjetosSelecionados(prev => 
      prev.includes(projetoId)
        ? prev.filter(id => id !== projetoId)
        : [...prev, projetoId]
    );
  };

  if (municipioLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Município</DialogTitle>
            <DialogDescription>Carregando dados do município...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!municipio) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Município</DialogTitle>
            <DialogDescription>
              Atualize os dados do município.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome do Município</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={estado} onValueChange={setEstado} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((est) => (
                    <SelectItem key={est} value={est}>
                      {est}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Projetos (opcional)</Label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                {projetos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum projeto cadastrado</p>
                ) : (
                  <div className="space-y-2">
                    {projetos.map((projeto) => (
                      <div key={projeto.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`projeto-${projeto.id}`}
                          checked={projetosSelecionados.includes(projeto.id)}
                          onCheckedChange={() => toggleProjeto(projeto.id)}
                        />
                        <label
                          htmlFor={`projeto-${projeto.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {projeto.nome} - {projeto.anoAcao}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMunicipio.isPending || !estado}>
              {updateMunicipio.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
