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
import { useCreateTurma } from '@/hooks/use-turmas';
import { useEscolas } from '@/hooks/use-escolas';

interface CreateTurmaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escolaId?: string;
}

export function CreateTurmaForm({ open, onOpenChange, escolaId: initialEscolaId }: CreateTurmaFormProps) {
  const [nome, setNome] = useState('');
  const [serie, setSerie] = useState('');
  const [turno, setTurno] = useState<'manha' | 'tarde' | 'integral' | 'noite'>('manha');
  const [anoLetivo, setAnoLetivo] = useState(new Date().getFullYear().toString());
  const [escolaId, setEscolaId] = useState(initialEscolaId || '');
  const createTurma = useCreateTurma();
  const { data: escolas = [] } = useEscolas();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escolaId) return;
    
    try {
      await createTurma.mutateAsync({
        nome,
        serie,
        turno,
        anoLetivo,
        escolaId,
      });
      setNome('');
      setSerie('');
      setTurno('manha');
      setAnoLetivo(new Date().getFullYear().toString());
      setEscolaId(initialEscolaId || '');
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
            <DialogTitle>Nova Turma</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova turma.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome da Turma</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Ex: 1º Ano A"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serie">Série</Label>
              <Input
                id="serie"
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                required
                placeholder="Ex: 1º Ano"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="turno">Turno</Label>
              <Select value={turno} onValueChange={(value: any) => setTurno(value)} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha">Manhã</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="integral">Integral</SelectItem>
                  <SelectItem value="noite">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="anoLetivo">Ano Letivo</Label>
              <Input
                id="anoLetivo"
                value={anoLetivo}
                onChange={(e) => setAnoLetivo(e.target.value)}
                required
                placeholder="2026"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="escola">Escola</Label>
              <Select 
                value={escolaId} 
                onValueChange={setEscolaId} 
                required
                disabled={!!initialEscolaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma escola" />
                </SelectTrigger>
                <SelectContent>
                  {escolas.map((escola) => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createTurma.isPending || !escolaId}>
              {createTurma.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
