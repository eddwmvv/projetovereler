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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateProjeto, useProjeto } from '@/hooks/use-projetos';
import { useEmpresas } from '@/hooks/use-empresas';
import { useMunicipios } from '@/hooks/use-municipios';
import { Checkbox } from '@/components/ui/checkbox';

interface EditProjetoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: string | null;
}

export function EditProjetoForm({ open, onOpenChange, projetoId }: EditProjetoFormProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [anoAcao, setAnoAcao] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo' | 'finalizado'>('ativo');
  const [municipiosSelecionados, setMunicipiosSelecionados] = useState<string[]>([]);
  
  const updateProjeto = useUpdateProjeto();
  const { data: projeto, isLoading: projetoLoading } = useProjeto(projetoId || '');
  const { data: empresas = [] } = useEmpresas();
  const { data: municipios = [] } = useMunicipios();

  // Preencher formulário quando projeto for carregado
  useEffect(() => {
    if (projeto) {
      setNome(projeto.nome);
      setDescricao(projeto.descricao || '');
      setEmpresaId(projeto.empresaId);
      setAnoAcao(projeto.anoAcao);
      setStatus(projeto.status);
      setMunicipiosSelecionados(projeto.municipiosIds || []);
    }
  }, [projeto]);

  // Resetar formulário quando dialog fechar
  useEffect(() => {
    if (!open) {
      setNome('');
      setDescricao('');
      setEmpresaId('');
      setAnoAcao('');
      setStatus('ativo');
      setMunicipiosSelecionados([]);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projetoId || !empresaId) return;
    
    try {
      await updateProjeto.mutateAsync({
        id: projetoId,
        data: {
          nome,
          descricao,
          empresaId,
          anoAcao,
          status,
          municipiosIds: municipiosSelecionados,
        },
      });
      onOpenChange(false);
    } catch (error) {
      // Error já é tratado no hook
    }
  };

  const toggleMunicipio = (municipioId: string) => {
    setMunicipiosSelecionados(prev => 
      prev.includes(municipioId)
        ? prev.filter(id => id !== municipioId)
        : [...prev, municipioId]
    );
  };

  if (projetoLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>Carregando dados do projeto...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!projeto) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>
              Atualize os dados do projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome do Projeto</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
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
              <Label htmlFor="anoAcao">Ano/Ação</Label>
              <Input
                id="anoAcao"
                value={anoAcao}
                onChange={(e) => setAnoAcao(e.target.value)}
                required
                placeholder="2026-1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Municípios (opcional)</Label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                {municipios.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum município cadastrado</p>
                ) : (
                  <div className="space-y-2">
                    {municipios.map((municipio) => (
                      <div key={municipio.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`municipio-${municipio.id}`}
                          checked={municipiosSelecionados.includes(municipio.id)}
                          onCheckedChange={() => toggleMunicipio(municipio.id)}
                        />
                        <label
                          htmlFor={`municipio-${municipio.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {municipio.nome} - {municipio.estado}
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
            <Button type="submit" disabled={updateProjeto.isPending || !empresaId}>
              {updateProjeto.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
