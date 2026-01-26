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
import { useCreateEmpresa } from '@/hooks/use-empresas';

interface CreateEmpresaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEmpresaForm({ open, onOpenChange }: CreateEmpresaFormProps) {
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo' | 'finalizado'>('ativo');
  const createEmpresa = useCreateEmpresa();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmpresa.mutateAsync({
        nomeFantasia,
        razaoSocial,
        cnpj,
        status,
      });
      setNomeFantasia('');
      setRazaoSocial('');
      setCnpj('');
      setStatus('ativo');
      onOpenChange(false);
    } catch (error) {
      // Error já é tratado no hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Empresa</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova empresa.
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
            <Button type="submit" disabled={createEmpresa.isPending}>
              {createEmpresa.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
