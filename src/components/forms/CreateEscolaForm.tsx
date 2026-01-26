import { useState } from 'react';
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
import { useCreateEscola } from '@/hooks/use-escolas';
import { useEmpresas } from '@/hooks/use-empresas';
import { useMunicipios } from '@/hooks/use-municipios';
import { useProjetos } from '@/hooks/use-projetos';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateEscolaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEscolaForm({ open, onOpenChange }: CreateEscolaFormProps) {
  const [nome, setNome] = useState('');
  const [municipioId, setMunicipioId] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [projetosSelecionados, setProjetosSelecionados] = useState<string[]>([]);
  const createEscola = useCreateEscola();
  const { data: empresas = [] } = useEmpresas();
  const { data: municipios = [] } = useMunicipios();
  const { data: projetos = [] } = useProjetos();

  // Filtrar projetos pela empresa selecionada
  const projetosFiltrados = projetos.filter(p => 
    !empresaId || p.empresaId === empresaId
  );


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!municipioId || !empresaId) return;
    
    try {
      await createEscola.mutateAsync({
        nome,
        municipioId,
        empresaId,
        projetosIds: projetosSelecionados.length > 0 ? projetosSelecionados : undefined,
      });
      setNome('');
      setMunicipioId('');
      setEmpresaId('');
      setProjetosSelecionados([]);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Escola</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova escola.
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
            <Button type="submit" disabled={createEscola.isPending || !municipioId || !empresaId}>
              {createEscola.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
