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
import { useUpdateEscola, useEscola } from '@/hooks/use-escolas';
import { useEmpresas } from '@/hooks/use-empresas';
import { useMunicipios } from '@/hooks/use-municipios';
import { useProjetos } from '@/hooks/use-projetos';
import { Checkbox } from '@/components/ui/checkbox';

interface EditEscolaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escolaId: string | null;
}

export function EditEscolaForm({ open, onOpenChange, escolaId }: EditEscolaFormProps) {
  const [nome, setNome] = useState('');
  const [municipioId, setMunicipioId] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [projetosSelecionados, setProjetosSelecionados] = useState<string[]>([]);
  
  const updateEscola = useUpdateEscola();
  const { data: escola, isLoading: escolaLoading } = useEscola(escolaId || '');
  const { data: empresas = [] } = useEmpresas();
  const { data: municipios = [] } = useMunicipios();
  const { data: projetos = [] } = useProjetos();

  // Filtrar projetos pela empresa selecionada
  const projetosFiltrados = projetos.filter(p => 
    !empresaId || p.empresaId === empresaId
  );

  // Preencher formulário quando escola for carregada
  useEffect(() => {
    if (escola) {
      setNome(escola.nome);
      setMunicipioId(escola.municipioId);
      setEmpresaId(escola.empresaId);
      setProjetosSelecionados(escola.projetosIds || []);
    }
  }, [escola]);

  // Resetar formulário quando dialog fechar
  useEffect(() => {
    if (!open) {
      setNome('');
      setMunicipioId('');
      setEmpresaId('');
      setProjetosSelecionados([]);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escolaId || !municipioId || !empresaId) return;
    
    try {
      await updateEscola.mutateAsync({
        id: escolaId,
        data: {
          nome,
          municipioId,
          empresaId,
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

  if (escolaLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Escola</DialogTitle>
            <DialogDescription>Carregando dados da escola...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!escola) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Escola</DialogTitle>
            <DialogDescription>
              Atualize os dados da escola.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome da Escola</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Select value={empresaId} onValueChange={setEmpresaId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nomeFantasia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="municipio">Município</Label>
              <Select 
                value={municipioId} 
                onValueChange={setMunicipioId} 
                required
                disabled={!empresaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um município" />
                </SelectTrigger>
                <SelectContent>
                  {municipios.map((municipio) => (
                    <SelectItem key={municipio.id} value={municipio.id}>
                      {municipio.nome} - {municipio.estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Projetos (opcional)</Label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                {!empresaId ? (
                  <p className="text-sm text-muted-foreground">Selecione uma empresa primeiro</p>
                ) : projetosFiltrados.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum projeto cadastrado para esta empresa</p>
                ) : (
                  <div className="space-y-2">
                    {projetosFiltrados.map((projeto) => (
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
            <Button type="submit" disabled={updateEscola.isPending || !municipioId || !empresaId}>
              {updateEscola.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
