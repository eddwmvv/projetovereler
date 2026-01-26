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
import { useUpdateEmpresa, useEmpresa } from '@/hooks/use-empresas';

interface EditEmpresaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaId: string | null;
}

export function EditEmpresaForm({ open, onOpenChange, empresaId }: EditEmpresaFormProps) {
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo' | 'finalizado'>('ativo');
  
  const updateEmpresa = useUpdateEmpresa();
  const { data: empresa, isLoading: empresaLoading } = useEmpresa(empresaId || '');

  // Preencher formulário quando empresa for carregada
  useEffect(() => {
    if (empresa) {
      setNomeFantasia(empresa.nomeFantasia);
      setRazaoSocial(empresa.razaoSocial);
      setCnpj(empresa.cnpj);
      setStatus(empresa.status);
    }
  }, [empresa]);

  // Resetar formulário quando dialog fechar
  useEffect(() => {
    if (!open) {
      setNomeFantasia('');
      setRazaoSocial('');
      setCnpj('');
      setStatus('ativo');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId) return;
    
    try {
      await updateEmpresa.mutateAsync({
        id: empresaId,
        data: {
          nomeFantasia,
          razaoSocial,
          cnpj,
          status,
        },
      });
      onOpenChange(false);
    } catch (error) {
      // Error já é tratado no hook
    }
  };

  if (empresaLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
            <DialogDescription>Carregando dados da empresa...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!empresa) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
            <DialogDescription>
              Atualize os dados da empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input
                id="nomeFantasia"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="razaoSocial">Razão Social</Label>
              <Input
                id="razaoSocial"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                required
                placeholder="00.000.000/0000-00"
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateEmpresa.isPending}>
              {updateEmpresa.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
